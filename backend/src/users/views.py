from django.contrib.auth.models import User
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from reports.models import Alumno, Rol


class GoogleRegisterView(APIView):
    def post(self, request):
        try:
            credential = request.data.get('credential', '').strip()
            google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '')

            if not google_client_id:
                return Response({'error': 'GOOGLE_CLIENT_ID no esta configurado en el backend.'}, status=500)
            if not credential:
                return Response({'error': 'Credential de Google requerido.'}, status=400)

            google_payload = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                google_client_id,
            )

            email = (google_payload.get('email') or '').strip().lower()
            full_name = (google_payload.get('name') or '').strip()
            picture_url = (google_payload.get('picture') or '').strip()
            google_sub = (google_payload.get('sub') or '').strip()
            email_verified = bool(google_payload.get('email_verified'))

            if not email:
                return Response({'error': 'Google no devolvio un correo valido.'}, status=400)
            if not email_verified:
                return Response({'error': 'El correo de Google no esta verificado.'}, status=400)

            first_name, last_name = self._split_name(full_name)
            role = 'parent'
            username = email[:150]

            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': email},
            )
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.is_active = True
            user.is_staff = False
            if created or not user.has_usable_password():
                user.set_unusable_password()
            user.save()
            self._upsert_student(email, full_name, first_name, last_name, picture_url, google_sub)

            refresh = RefreshToken()
            refresh['email'] = email
            refresh['role'] = role
            refresh['name'] = full_name
            refresh['picture'] = picture_url
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': email,
                'name': full_name or email.split('@')[0],
                'picture': picture_url,
                'role': role,
                'created': created,
                'message': 'Acceso al portal de padres habilitado correctamente.' if created else 'Datos del alumno actualizados correctamente.',
            })
        except Exception as e:
            print(f"ERROR en GoogleRegisterView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

    def _split_name(self, full_name):
        if not full_name:
            return '', ''

        parts = full_name.split()
        if len(parts) == 1:
            return parts[0], ''
        return parts[0], ' '.join(parts[1:])

    def _upsert_student(self, email, full_name, first_name, last_name, picture_url, google_sub):
        alumno = Alumno.objects.filter(email__iexact=email).first()
        if not alumno:
            alumno = Alumno()
            alumno.codigo_alumno = self._generate_student_code()
            alumno.dni = self._generate_student_dni(google_sub or email)

        role = Rol.objects.filter(nombre_rol__iexact='Alumno').first()
        if not role:
            role = Rol.objects.create(
                nombre_rol='Alumno',
                descripcion='Estudiante autenticado por Google OAuth.',
            )

        alumno.nombre = first_name or full_name[:50] or 'Alumno'
        alumno.apellido_paterno = (last_name.split()[0] if last_name else 'OAuth')[:50]
        alumno.apellido_materno = (' '.join(last_name.split()[1:]) if len(last_name.split()) > 1 else '')[:50]
        alumno.email = email
        alumno.foto_perfil = picture_url
        alumno.estado = 'activo'
        alumno.fk_rol = role
        alumno.save()
        return alumno

    def _generate_student_code(self):
        last_student = Alumno.objects.order_by('-pk_alumno').first()
        next_id = (last_student.pk_alumno + 1) if last_student else 1
        code = f"ALU-OAUTH-{next_id:04d}"
        while Alumno.objects.filter(codigo_alumno=code).exists():
            next_id += 1
            code = f"ALU-OAUTH-{next_id:04d}"
        return code

    def _generate_student_dni(self, seed_value):
        digits = ''.join(char for char in seed_value if char.isdigit())
        if len(digits) < 8:
            digits = (digits + '00000000')[:8]
        else:
            digits = digits[:12]

        candidate = digits
        counter = 1
        while Alumno.objects.filter(dni=candidate).exists():
            suffix = str(counter).zfill(max(0, 12 - len(digits)))
            candidate = f"{digits}{suffix}"[:12]
            counter += 1
        return candidate
