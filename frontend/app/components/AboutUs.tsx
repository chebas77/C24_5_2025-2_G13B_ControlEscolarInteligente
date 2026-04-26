"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, HeartHandshake, Mail, MapPin, Users } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const carouselSlides = [
  {
    image: "https://feyalegria39.org.pe/wp-content/uploads/2026/03/IMG_4177-1300x867.jpg",
    eyebrow: "Comunidad educativa",
    title: "Presencia que acompana",
    description: "Una escuela que vive sus actividades institucionales con cercania, participacion y sentido de pertenencia.",
  },
  {
    image: "https://feyalegria39.org.pe/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-03-at-3.55.00-PM-2-1300x975.jpeg",
    eyebrow: "Experiencia escolar",
    title: "Aprender tambien es compartir",
    description: "La vida del colegio se expresa en encuentros, celebraciones y momentos que fortalecen identidad y comunidad.",
  },
  {
    image: "https://feyalegria39.org.pe/wp-content/uploads/2025/11/IMG_9178-1300x731.jpg",
    eyebrow: "Formacion con proyeccion",
    title: "Una escuela conectada con el futuro",
    description: "La propuesta educativa impulsa crecimiento academico, formacion en valores y mirada vocacional.",
  },
];

const pillars = [
  {
    title: "Formacion integral",
    description: "La experiencia escolar articula aprendizaje, valores, acompanamiento y proyecto de vida.",
    icon: GraduationCap,
  },
  {
    title: "Vinculo con las familias",
    description: "La comunidad educativa se fortalece cuando la escuela y el hogar avanzan en la misma direccion.",
    icon: HeartHandshake,
  },
  {
    title: "Proyeccion al futuro",
    description: "El proceso formativo busca abrir oportunidades reales para la continuidad de estudios y la vida.",
    icon: BriefcaseBusiness,
  },
];

const impactNotes = [
  "Acompanamiento cercano a estudiantes y familias.",
  "Cultura institucional basada en respeto, responsabilidad y buen trato.",
  "Actividades formativas, academicas y vocacionales articuladas con la vida escolar.",
  "Identidad educativa al servicio de la comunidad de El Agustino.",
];

export function AboutUs() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = carouselSlides[activeSlide];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute left-[-8rem] top-10 h-[24rem] w-[24rem] rounded-[48%_52%_62%_38%/45%_42%_58%_55%] bg-[#f7b2ab] opacity-80 blur-[2px] dark:bg-[#7f1d1d]/28" />
      <div className="absolute right-[-7rem] top-28 h-[26rem] w-[26rem] rounded-[56%_44%_37%_63%/43%_50%_50%_57%] bg-[#ffd8d1] opacity-70 dark:bg-[#3b0d0d]/30" />

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative z-10 max-w-xl">
            <p className="text-[2.7rem] font-semibold uppercase tracking-tight text-[#1e1b1b] dark:text-white sm:text-[3.4rem]">
              Nosotros
            </p>
            <div className="mt-2 h-1.5 w-28 rounded-full bg-[#cf2e2e] dark:bg-[#ff8a8a]" />

            <p className="mt-8 text-lg leading-8 text-slate-700 dark:text-slate-300">
              Fe y Alegria N. 39 acompana a su comunidad educativa desde El Agustino con una propuesta que combina
              cercania, formacion academica, vida institucional y crecimiento en valores.
            </p>

            <p className="mt-5 text-base leading-7 text-slate-500 dark:text-slate-400">
              La escuela busca que cada estudiante crezca con identidad, responsabilidad y oportunidades reales de
              desarrollo personal y educativo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="h-11 rounded-full bg-[#cf2e2e] px-6 text-white hover:bg-[#b72323] dark:bg-[#e54848] dark:hover:bg-[#f25f5f]">
                Conocer la propuesta
                <ArrowRight className="size-4" />
              </Button>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
                <MapPin className="size-4 text-[#cf2e2e] dark:text-[#ff8a8a]" />
                El Agustino, Lima
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="relative min-h-[29rem] overflow-hidden rounded-[2.5rem] shadow-[0_28px_90px_rgba(207,46,46,0.16)] dark:shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
              <div className="absolute inset-0 scale-110 blur-2xl">
                <ImageWithFallback src={currentSlide.image} alt={currentSlide.title} className="h-full w-full object-cover" />
              </div>

              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(207,46,46,0.22),rgba(23,23,23,0.74))] dark:bg-[linear-gradient(135deg,rgba(127,29,29,0.25),rgba(15,23,42,0.45),rgba(2,6,23,0.82))]" />
              <ImageWithFallback
                src={currentSlide.image}
                alt={currentSlide.title}
                className="absolute inset-0 h-full w-full object-cover opacity-88"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,0.04),rgba(20,20,20,0.68))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.12),rgba(2,6,23,0.76))]" />

              <div className="relative flex min-h-[29rem] flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-full bg-white/18 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                    {currentSlide.eyebrow}
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-black/18 px-3 py-2 backdrop-blur">
                    {carouselSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        aria-label={`Ir a ${slide.title}`}
                        onClick={() => setActiveSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeSlide ? "w-7 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="max-w-xl">
                  <h2 className="text-3xl font-semibold text-white sm:text-4xl">{currentSlide.title}</h2>
                  <p className="mt-4 max-w-lg text-base leading-7 text-white/88">{currentSlide.description}</p>

                  <div className="mt-6 flex items-center gap-4 rounded-[1.6rem] border border-white/18 bg-white/10 px-4 py-4 backdrop-blur">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Image src="/logo.jpg" alt="Logo de Fe y Alegria 39" width={44} height={44} className="h-auto w-10" priority />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Fe y Alegria N. 39</p>
                      <p className="mt-1 text-sm leading-6 text-white/78">
                        Identidad educativa con presencia en la vida de su comunidad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] bg-white px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.07)] dark:bg-slate-900/70 dark:shadow-[0_24px_70px_rgba(2,6,23,0.4)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#cf2e2e] dark:text-[#ff8a8a]">Quienes somos</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Una escuela presente en la vida de su comunidad</h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              <p>
                Fe y Alegria N. 39 desarrolla su labor educativa desde una identidad institucional que pone en el
                centro a la persona, la comunidad y el sentido formativo de la escuela.
              </p>
              <p>
                La experiencia escolar busca que cada estudiante encuentre acompanamiento, orden, referentes claros y
                oportunidades para crecer en lo academico, lo humano y lo social.
              </p>
              <p>
                Esta mirada se expresa en la vida diaria del colegio: el trabajo con las familias, la cultura de
                valores, la cercania del equipo docente y la apuesta por trayectorias educativas con proyeccion.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#1f1a1a] px-6 py-7 text-white shadow-[0_20px_60px_rgba(31,26,26,0.22)] dark:bg-[#0f172a]/88 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ffb1b1]">Impacto institucional</p>
            <h2 className="mt-3 text-2xl font-semibold">Lo que sostiene nuestra propuesta</h2>
            <div className="mt-6 space-y-3">
              {impactNotes.map((note) => (
                <div key={note} className="rounded-2xl bg-white/8 px-4 py-3 text-sm leading-6 text-slate-100">
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[2rem] bg-white px-6 py-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1 dark:bg-slate-900/70 dark:shadow-[0_24px_70px_rgba(2,6,23,0.35)]"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#ffe4df] text-[#cf2e2e] dark:bg-red-500/10 dark:text-[#ff8a8a]">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-[2.5rem] bg-[linear-gradient(135deg,#fff0ed,#ffffff)] px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:bg-[linear-gradient(135deg,rgba(31,26,26,0.92),rgba(15,23,42,0.88))] dark:shadow-[0_24px_70px_rgba(2,6,23,0.4)]">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#cf2e2e] dark:text-[#ff8a8a]">Comunidad y contacto</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Una escuela que dialoga con su entorno</h2>
              <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                La relacion con la comunidad es parte de la vida institucional. El colegio acompana procesos,
                fortalece vinculos y busca que la experiencia educativa tenga sentido dentro y fuera del aula.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm dark:bg-slate-900/70">
                <MapPin className="size-5 text-[#cf2e2e] dark:text-[#ff8a8a]" />
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Ubicacion</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">El Agustino, Lima</p>
              </div>

              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm dark:bg-slate-900/70">
                <Mail className="size-5 text-[#cf2e2e] dark:text-[#ff8a8a]" />
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Correo</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">feyalegria39@hotmail.com</p>
              </div>

              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm dark:bg-slate-900/70">
                <Users className="size-5 text-[#cf2e2e] dark:text-[#ff8a8a]" />
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Comunidad</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Estudiantes, docentes y familias</p>
              </div>

              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm dark:bg-slate-900/70">
                <BookOpen className="size-5 text-[#cf2e2e] dark:text-[#ff8a8a]" />
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Propuesta</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Educacion con valores y proyeccion</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
