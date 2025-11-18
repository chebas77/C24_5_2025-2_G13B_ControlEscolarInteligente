from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Padre, Alumno, AsistenciaDetalle, Asistencia, NotificacionPadre, PersonalEducativo, Comunicado
from django.db.models import Prefetch, Q
from django.http import HttpResponse
from datetime import datetime, timedelta
import csv
import io
import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from django.conf import settings

class PadreLoginView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email', '').strip()
            dni_hijo = request.data.get('dni_hijo', '').strip()
            
            print(f"Login attempt - Email: {email}, DNI hijo: {dni_hijo}")
            
            if not email or not dni_hijo:
                return Response({'error': 'Email y DNI del hijo son requeridos'}, status=400)
            
            # Verificar si el padre existe
            padre = Padre.objects.filter(email=email).first()
            print(f"Padre encontrado: {padre}")
            
            if not padre:
                return Response({'error': 'Padre no encontrado'}, status=404)
            
            # Verificar si el hijo existe y pertenece a la familia del padre
            alumno = Alumno.objects.filter(
                dni=dni_hijo,
                fk_codigo_familia=padre.fk_codigo_familia
            ).first()
            print(f"Alumno encontrado: {alumno}")
            
            if not alumno:
                return Response({'error': 'Hijo no encontrado o no pertenece a esta familia'}, status=404)
            
            # Generar tokens JWT
            refresh = RefreshToken()
            refresh['email'] = email
            refresh['role'] = 'parent'
            refresh['dni_hijo'] = dni_hijo
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': email,
                'nombre': f"{padre.nombre} {padre.apellido_paterno}"
            })
        except Exception as e:
            print(f"ERROR en PadreLoginView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Error interno del servidor: {str(e)}'}, status=500)

class PadreAlumnosView(APIView):
    def get(self, request, email):
        try:
            print(f"Buscando alumnos para padre: {email}")
            padre = Padre.objects.filter(email=email).first()
            
            if not padre:
                return Response({'error': 'Padre no encontrado'}, status=404)
            
            print(f"Padre encontrado: {padre.nombre} {padre.apellido_paterno}, Familia: {padre.fk_codigo_familia}")
            
            alumnos = Alumno.objects.filter(fk_codigo_familia=padre.fk_codigo_familia)
            print(f"Número de alumnos encontrados: {alumnos.count()}")
            
            alumnos_data = []
            
            for alumno in alumnos:
                print(f"Procesando alumno: {alumno.nombre} {alumno.apellido_paterno}")
                
                # Obtener asistencias con información del profesor y curso
                asistencia_qs = AsistenciaDetalle.objects.filter(
                    fk_alumno=alumno
                ).select_related(
                    'fk_asistencia', 
                    'fk_asistencia__fk_personal'
                ).order_by('-fk_asistencia__fecha')
                
                print(f"Registros de asistencia encontrados: {asistencia_qs.count()}")
                
                attendance = []
                
                for detalle in asistencia_qs:
                    teacher_name = 'Sin asignar'
                    curso = 'Sin curso'
                    
                    if detalle.fk_asistencia:
                        if detalle.fk_asistencia.fk_personal:
                            personal = detalle.fk_asistencia.fk_personal
                            teacher_name = f"{personal.nombre} {personal.apellido_paterno}"
                        
                        if detalle.fk_asistencia.curso:
                            curso = detalle.fk_asistencia.curso
                    
                    # Determinar el estado de asistencia
                    status = 'absent'  # Por defecto
                    if detalle.estado_asistencia:
                        estado_lower = detalle.estado_asistencia.lower()
                        if 'presente' in estado_lower or 'asistio' in estado_lower:
                            status = 'present'
                        elif 'tarde' in estado_lower or 'tardanza' in estado_lower:
                            status = 'late'
                        elif 'ausente' in estado_lower or 'falta' in estado_lower:
                            status = 'absent'
                    
                    fecha_str = None
                    if detalle.fk_asistencia and detalle.fk_asistencia.fecha:
                        fecha_str = str(detalle.fk_asistencia.fecha)
                    
                    time_str = None
                    if detalle.hora_entrada:
                        time_str = str(detalle.hora_entrada)
                    
                    record = {
                        'date': fecha_str,
                        'status': status,
                        'time': time_str,
                        'teacher': teacher_name,
                        'course': curso,
                        'observations': detalle.observacion or ''
                    }
                    
                    print(f"  Registro asistencia: fecha={fecha_str}, estado={detalle.estado_asistencia}, status={status}, hora={time_str}")
                    attendance.append(record)
                
                alumnos_data.append({
                    'id': str(alumno.pk_alumno),
                    'name': f"{alumno.nombre} {alumno.apellido_paterno} {alumno.apellido_materno}",
                    'grade': f"{alumno.grado} {alumno.seccion}" if alumno.grado and alumno.seccion else "Sin asignar",
                    'photo': '👧',
                    'attendance': attendance
                })
            
            print(f"Total alumnos procesados: {len(alumnos_data)}")
            return Response({'alumnos': alumnos_data})
            
        except Exception as e:
            print(f"ERROR en PadreAlumnosView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)


class AlumnoCalificacionesView(APIView):
    """
    Endpoint para obtener calificaciones del alumno
    Por ahora retorna datos de ejemplo, listo para integrar con tabla de calificaciones cuando exista
    """
    def get(self, request, alumno_id):
        try:
            alumno = Alumno.objects.filter(pk_alumno=alumno_id).first()
            if not alumno:
                return Response({'error': 'Alumno no encontrado'}, status=404)
            
            # TODO: Cuando se cree la tabla 'calificacion', reemplazar con datos reales
            # Ejemplo de query: Calificacion.objects.filter(fk_alumno=alumno)
            
            calificaciones = {
                'promedio_general': 16.5,
                'cursos': [
                    {'nombre': 'Matemáticas', 'nota': 17},
                    {'nombre': 'Comunicación', 'nota': 16},
                    {'nombre': 'Ciencias', 'nota': 16.8},
                    {'nombre': 'Inglés', 'nota': 15.5},
                    {'nombre': 'Historia', 'nota': 16.2}
                ]
            }
            
            return Response(calificaciones)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class AlumnoComportamientoView(APIView):
    """
    Endpoint para obtener el comportamiento/conducta del alumno
    Por ahora retorna datos de ejemplo, listo para integrar con tabla de comportamiento cuando exista
    """
    def get(self, request, alumno_id):
        try:
            alumno = Alumno.objects.filter(pk_alumno=alumno_id).first()
            if not alumno:
                return Response({'error': 'Alumno no encontrado'}, status=404)
            
            # TODO: Cuando se cree la tabla 'comportamiento', reemplazar con datos reales
            # Ejemplo de query: Comportamiento.objects.filter(fk_alumno=alumno)
            
            comportamiento = {
                'conducta': 'A',
                'participacion': 'Muy Buena',
                'trabajo_equipo': 'Excelente',
                'puntualidad_tareas': 'Buena',
                'responsabilidad': 'Muy Buena',
                'respeto': 'Excelente'
            }
            
            return Response(comportamiento)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class AlumnoComunicadosView(APIView):
    """
    Endpoint para obtener comunicados del alumno
    Integra con la tabla comunicado - muestra comunicados generales, del grado o de la familia
    """
    def get(self, request, alumno_id):
        try:
            print(f"Buscando comunicados para alumno_id: {alumno_id}")
            alumno = Alumno.objects.filter(pk_alumno=alumno_id).first()
            print(f"Alumno encontrado: {alumno}")
            
            if not alumno:
                return Response({'error': 'Alumno no encontrado'}, status=404)
            
            print(f"Grado del alumno: {alumno.grado}, Codigo familia: {alumno.fk_codigo_familia}")
            
            # Obtener comunicados relevantes para el alumno:
            # 1. Comunicados para todos
            # 2. Comunicados para su grado específico
            # 3. Comunicados para su familia específica
            comunicados_query = Comunicado.objects.filter(
                Q(dirigido_a='todos') |
                Q(dirigido_a='grado_especifico', grado=alumno.grado) |
                Q(dirigido_a='familia_especifica', fk_codigo_familia=alumno.fk_codigo_familia),
                estado='activo'
            ).select_related('fk_personal').order_by('-prioridad', '-fecha_publicacion')[:10]
            
            print(f"Comunicados encontrados: {comunicados_query.count()}")
            
            comunicados = []
            for com in comunicados_query:
                fecha = None
                if com.fecha_evento:
                    fecha = com.fecha_evento.strftime('%d/%m')
                elif com.fecha_publicacion:
                    fecha = com.fecha_publicacion.strftime('%d/%m')
                
                # Mapear tipo a los valores esperados por el frontend
                tipo = com.tipo if com.tipo in ['info', 'success', 'warning'] else 'info'
                if com.tipo == 'urgent':
                    tipo = 'warning'
                
                # Construir el mensaje completo
                mensaje_completo = com.titulo
                if com.mensaje and com.mensaje != com.titulo:
                    mensaje_completo = f"{com.titulo}"
                
                comunicados.append({
                    'fecha': fecha,
                    'mensaje': mensaje_completo,
                    'tipo': tipo,
                    'prioridad': com.prioridad or 1
                })
            
            # Si no hay comunicados en la BD, mostrar ejemplos
            if not comunicados:
                print("No hay comunicados en BD, usando ejemplos")
                comunicados = [
                    {'fecha': '15/02', 'mensaje': 'Evaluación de matemáticas el viernes 18', 'tipo': 'info', 'prioridad': 2},
                    {'fecha': '12/02', 'mensaje': 'Excelente participación en feria de ciencias', 'tipo': 'success', 'prioridad': 1},
                    {'fecha': '10/02', 'mensaje': 'Reunión de padres - 20 de febrero, 6:00 PM', 'tipo': 'warning', 'prioridad': 3},
                    {'fecha': '08/02', 'mensaje': 'Festival de arte el 25 de febrero', 'tipo': 'info', 'prioridad': 1},
                    {'fecha': '05/02', 'mensaje': 'Olimpiadas deportivas - inscripciones abiertas', 'tipo': 'info', 'prioridad': 1}
                ]
            
            return Response({'comunicados': comunicados})
        except Exception as e:
            print(f"ERROR en AlumnoComunicadosView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)


class ExportarAsistenciaView(APIView):
    """
    Endpoint para exportar asistencia del alumno en formatos PDF, CSV o Excel
    Incluye filtrado por período de tiempo
    """
    def get(self, request, alumno_id):
        try:
            # Obtener parámetros
            formato = request.GET.get('formato', 'pdf').lower()  # pdf, csv, excel
            periodo = request.GET.get('periodo', 'all')  # all, week, month, quarter, year
            
            # Validar alumno
            alumno = Alumno.objects.filter(pk_alumno=alumno_id).first()
            if not alumno:
                return Response({'error': 'Alumno no encontrado'}, status=404)
            
            # Calcular fecha de inicio según el período
            now = datetime.now()
            fecha_inicio = None
            
            if periodo == 'week':
                fecha_inicio = now - timedelta(days=7)
            elif periodo == 'month':
                fecha_inicio = now - timedelta(days=30)
            elif periodo == 'quarter':
                fecha_inicio = now - timedelta(days=90)
            elif periodo == 'year':
                fecha_inicio = now - timedelta(days=365)
            # Si es 'all', fecha_inicio queda None y trae todos
            
            # Obtener asistencias
            asistencia_qs = AsistenciaDetalle.objects.filter(
                fk_alumno=alumno
            ).select_related(
                'fk_asistencia', 
                'fk_asistencia__fk_personal'
            ).order_by('-fk_asistencia__fecha')
            
            # Filtrar por fecha si es necesario
            if fecha_inicio:
                asistencia_qs = asistencia_qs.filter(fk_asistencia__fecha__gte=fecha_inicio)
            
            # Preparar datos
            attendance_data = []
            for detalle in asistencia_qs:
                teacher_name = 'Sin asignar'
                if detalle.fk_asistencia and detalle.fk_asistencia.fk_personal:
                    personal = detalle.fk_asistencia.fk_personal
                    teacher_name = f"{personal.nombre} {personal.apellido_paterno}"
                
                status = 'Ausente'
                if detalle.estado_asistencia:
                    estado_lower = detalle.estado_asistencia.lower()
                    if 'presente' in estado_lower or 'asistio' in estado_lower:
                        status = 'Presente'
                    elif 'tarde' in estado_lower or 'tardanza' in estado_lower:
                        status = 'Tardanza'
                
                attendance_data.append({
                    'fecha': str(detalle.fk_asistencia.fecha) if detalle.fk_asistencia else '',
                    'estado': status,
                    'hora': str(detalle.hora_entrada) if detalle.hora_entrada else '',
                    'profesor': teacher_name,
                    'curso': detalle.fk_asistencia.curso if detalle.fk_asistencia and detalle.fk_asistencia.curso else '',
                    'observaciones': detalle.observacion or ''
                })
            
            # Calcular estadísticas
            total = len(attendance_data)
            presente = sum(1 for d in attendance_data if d['estado'] == 'Presente')
            tardanza = sum(1 for d in attendance_data if d['estado'] == 'Tardanza')
            ausente = sum(1 for d in attendance_data if d['estado'] == 'Ausente')
            
            # Información del alumno y reporte
            alumno_info = {
                'nombre': f"{alumno.nombre} {alumno.apellido_paterno} {alumno.apellido_materno}",
                'grado': f"{alumno.grado} {alumno.seccion}" if alumno.grado and alumno.seccion else "Sin asignar",
                'dni': alumno.dni or ''
            }
            
            periodo_texto = {
                'all': 'Todos los registros',
                'week': 'Última semana',
                'month': 'Último mes',
                'quarter': 'Último trimestre',
                'year': 'Último año'
            }.get(periodo, 'Período personalizado')
            
            # Generar archivo según formato
            if formato == 'pdf':
                return self._generar_pdf(alumno_info, attendance_data, periodo_texto, total, presente, tardanza, ausente)
            elif formato == 'csv':
                return self._generar_csv(alumno_info, attendance_data, periodo_texto, total, presente, tardanza, ausente)
            elif formato == 'excel':
                return self._generar_excel(alumno_info, attendance_data, periodo_texto, total, presente, tardanza, ausente)
            else:
                return Response({'error': 'Formato no válido. Use: pdf, csv o excel'}, status=400)
                
        except Exception as e:
            print(f"ERROR en ExportarAsistenciaView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
    
    def _generar_pdf(self, alumno_info, attendance_data, periodo_texto, total, presente, tardanza, ausente):
        """Genera un PDF con el reporte de asistencia"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Buscar logo
        logo_path = os.path.join(settings.BASE_DIR, 'static', 'logo.jpg')
        if not os.path.exists(logo_path):
            # Si no existe, buscar en otros posibles lugares
            logo_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'logo.jpg')
        
        # Crear tabla con logo y título
        if os.path.exists(logo_path):
            try:
                logo = Image(logo_path, width=1*inch, height=1*inch)
                
                # Título
                title_style = ParagraphStyle(
                    'CustomTitle',
                    parent=styles['Heading1'],
                    fontSize=16,
                    textColor=colors.HexColor('#dc2626'),
                    alignment=1  # Center
                )
                title = Paragraph("REPORTE DE ASISTENCIA", title_style)
                
                # Tabla para alinear logo a la izquierda y título al centro
                header_data = [[logo, title]]
                header_table = Table(header_data, colWidths=[1.2*inch, 5.8*inch])
                header_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                    ('ALIGN', (1, 0), (1, 0), 'CENTER'),
                ]))
                elements.append(header_table)
                elements.append(Spacer(1, 20))
            except Exception as e:
                # Si falla la carga del logo, usar solo título
                title_style = ParagraphStyle(
                    'CustomTitle',
                    parent=styles['Heading1'],
                    fontSize=16,
                    textColor=colors.HexColor('#dc2626'),
                    spaceAfter=30,
                    alignment=1
                )
                elements.append(Paragraph("REPORTE DE ASISTENCIA", title_style))
                elements.append(Spacer(1, 12))
        else:
            # Si no hay logo, solo título
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                textColor=colors.HexColor('#dc2626'),
                spaceAfter=30,
                alignment=1
            )
            elements.append(Paragraph("REPORTE DE ASISTENCIA", title_style))
            elements.append(Spacer(1, 12))
        
        # Información del alumno
        info_data = [
            ['Estudiante:', alumno_info['nombre']],
            ['Grado:', alumno_info['grado']],
            ['DNI:', alumno_info['dni']],
            ['Período:', periodo_texto],
            ['Fecha de reporte:', datetime.now().strftime('%d/%m/%Y %H:%M')]
        ]
        
        info_table = Table(info_data, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 20))
        
        # Estadísticas
        stats_data = [
            ['Total de días', 'Presente', 'Tardanzas', 'Ausencias'],
            [str(total), str(presente), str(tardanza), str(ausente)]
        ]
        
        stats_table = Table(stats_data, colWidths=[1.5*inch]*4)
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#f3f4f6')),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 20))
        
        # Detalle de asistencias
        if attendance_data:
            elements.append(Paragraph("Detalle de Asistencias", styles['Heading2']))
            elements.append(Spacer(1, 12))
            
            detail_data = [['Fecha', 'Estado', 'Hora', 'Profesor', 'Observaciones']]
            
            for record in attendance_data:
                detail_data.append([
                    record['fecha'],
                    record['estado'],
                    record['hora'],
                    record['profesor'][:20] + '...' if len(record['profesor']) > 20 else record['profesor'],
                    record['observaciones'][:30] + '...' if len(record['observaciones']) > 30 else record['observaciones']
                ])
            
            detail_table = Table(detail_data, colWidths=[1*inch, 1*inch, 0.8*inch, 1.5*inch, 1.7*inch])
            
            # Estilos base
            table_styles = [
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6b7280')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            ]
            
            # Aplicar colores según el estado
            for i, record in enumerate(attendance_data, start=1):
                if record['estado'] == 'Tardanza':
                    table_styles.append(('BACKGROUND', (1, i), (1, i), colors.HexColor('#fef3c7')))
                    table_styles.append(('TEXTCOLOR', (1, i), (1, i), colors.HexColor('#92400e')))
                elif record['estado'] == 'Ausente':
                    table_styles.append(('BACKGROUND', (1, i), (1, i), colors.HexColor('#fee2e2')))
                    table_styles.append(('TEXTCOLOR', (1, i), (1, i), colors.HexColor('#991b1b')))
                elif record['estado'] == 'Presente':
                    table_styles.append(('BACKGROUND', (1, i), (1, i), colors.HexColor('#dcfce7')))
                    table_styles.append(('TEXTCOLOR', (1, i), (1, i), colors.HexColor('#166534')))
            
            detail_table.setStyle(TableStyle(table_styles))
            elements.append(detail_table)
        
        # Construir PDF
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        filename = f"asistencia_{alumno_info['nombre'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    
    def _generar_csv(self, alumno_info, attendance_data, periodo_texto, total, presente, tardanza, ausente):
        """Genera un archivo CSV con el reporte de asistencia"""
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        filename = f"asistencia_{alumno_info['nombre'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Agregar BOM para UTF-8
        response.write('\ufeff')
        
        # Usar punto y coma como delimitador para Excel en español
        writer = csv.writer(response, delimiter=';')
        
        # Encabezado con información
        writer.writerow(['REPORTE DE ASISTENCIA - Fe y Alegría'])
        writer.writerow([])
        writer.writerow(['Estudiante:', alumno_info['nombre']])
        writer.writerow(['Grado:', alumno_info['grado']])
        writer.writerow(['DNI:', alumno_info['dni']])
        writer.writerow(['Período:', periodo_texto])
        writer.writerow(['Fecha de reporte:', datetime.now().strftime('%d/%m/%Y %H:%M')])
        writer.writerow([])
        
        # Estadísticas
        writer.writerow(['ESTADÍSTICAS'])
        writer.writerow(['Total de días', 'Presente', 'Tardanzas', 'Ausencias'])
        writer.writerow([total, presente, tardanza, ausente])
        writer.writerow([])
        
        # Detalle de asistencias
        writer.writerow(['DETALLE DE ASISTENCIAS'])
        writer.writerow(['Fecha', 'Estado', 'Hora', 'Profesor', 'Curso', 'Observaciones'])
        
        for record in attendance_data:
            writer.writerow([
                record['fecha'],
                record['estado'],
                record['hora'],
                record['profesor'],
                record['curso'],
                record['observaciones']
            ])
        
        return response
    
    def _generar_excel(self, alumno_info, attendance_data, periodo_texto, total, presente, tardanza, ausente):
        """Genera un archivo Excel con el reporte de asistencia"""
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Reporte de Asistencia"
        
        # Estilos
        header_font = Font(name='Arial', size=14, bold=True, color='FFFFFF')
        header_fill = PatternFill(start_color='DC2626', end_color='DC2626', fill_type='solid')
        
        subheader_font = Font(name='Arial', size=11, bold=True)
        subheader_fill = PatternFill(start_color='6B7280', end_color='6B7280', fill_type='solid')
        subheader_font_white = Font(name='Arial', size=11, bold=True, color='FFFFFF')
        
        normal_font = Font(name='Arial', size=10)
        bold_font = Font(name='Arial', size=10, bold=True)
        
        center_alignment = Alignment(horizontal='center', vertical='center')
        left_alignment = Alignment(horizontal='left', vertical='center')
        
        border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        # Título
        sheet.merge_cells('A1:F1')
        cell = sheet['A1']
        cell.value = 'REPORTE DE ASISTENCIA - Fe y Alegría'
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_alignment
        
        # Información del alumno
        row = 3
        info_fields = [
            ('Estudiante:', alumno_info['nombre']),
            ('Grado:', alumno_info['grado']),
            ('DNI:', alumno_info['dni']),
            ('Período:', periodo_texto),
            ('Fecha de reporte:', datetime.now().strftime('%d/%m/%Y %H:%M'))
        ]
        
        for label, value in info_fields:
            sheet[f'A{row}'] = label
            sheet[f'A{row}'].font = bold_font
            sheet[f'B{row}'] = value
            sheet[f'B{row}'].font = normal_font
            row += 1
        
        # Estadísticas
        row += 2
        sheet[f'A{row}'] = 'ESTADÍSTICAS'
        sheet[f'A{row}'].font = subheader_font
        row += 1
        
        stats_headers = ['Total de días', 'Presente', 'Tardanzas', 'Ausencias']
        stats_values = [total, presente, tardanza, ausente]
        
        for col, (header, value) in enumerate(zip(stats_headers, stats_values), start=1):
            cell = sheet.cell(row=row, column=col)
            cell.value = header
            cell.font = subheader_font_white
            cell.fill = subheader_fill
            cell.alignment = center_alignment
            cell.border = border
            
            cell = sheet.cell(row=row+1, column=col)
            cell.value = value
            cell.font = normal_font
            cell.alignment = center_alignment
            cell.border = border
        
        # Detalle de asistencias
        row += 4
        sheet[f'A{row}'] = 'DETALLE DE ASISTENCIAS'
        sheet[f'A{row}'].font = subheader_font
        row += 1
        
        # Encabezados de tabla
        headers = ['Fecha', 'Estado', 'Hora', 'Profesor', 'Curso', 'Observaciones']
        for col, header in enumerate(headers, start=1):
            cell = sheet.cell(row=row, column=col)
            cell.value = header
            cell.font = subheader_font_white
            cell.fill = subheader_fill
            cell.alignment = center_alignment
            cell.border = border
        
        # Datos de asistencia
        for record in attendance_data:
            row += 1
            data = [
                record['fecha'],
                record['estado'],
                record['hora'],
                record['profesor'],
                record['curso'],
                record['observaciones']
            ]
            
            for col, value in enumerate(data, start=1):
                cell = sheet.cell(row=row, column=col)
                cell.value = value
                cell.font = normal_font
                cell.alignment = left_alignment if col > 3 else center_alignment
                cell.border = border
        
        # Ajustar ancho de columnas
        sheet.column_dimensions['A'].width = 12
        sheet.column_dimensions['B'].width = 12
        sheet.column_dimensions['C'].width = 10
        sheet.column_dimensions['D'].width = 25
        sheet.column_dimensions['E'].width = 20
        sheet.column_dimensions['F'].width = 35
        
        # Guardar en buffer
        buffer = io.BytesIO()
        workbook.save(buffer)
        buffer.seek(0)
        
        response = HttpResponse(
            buffer,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        filename = f"asistencia_{alumno_info['nombre'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.xlsx"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response