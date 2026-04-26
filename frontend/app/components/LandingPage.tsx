"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CalendarCheck2, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const heroSlides = [
  {
    image: "https://feyalegria39.org.pe/wp-content/uploads/2026/03/IMG_4177-1300x867.jpg",
    eyebrow: "Fe y Alegria N. 39",
    title: "Una bienvenida con identidad, comunidad y presencia institucional",
    description:
      "La plataforma de control escolar presenta al colegio desde una experiencia visual mas clara, sobria y cercana.",
  },
  {
    image: "https://feyalegria39.org.pe/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-03-at-3.55.00-PM-2-1300x975.jpeg",
    eyebrow: "Vida escolar",
    title: "La experiencia educativa tambien se construye en comunidad y participacion",
    description:
      "La vida institucional integra acompanamiento, actividades formativas y una relacion mas cercana con las familias.",
  },
  {
    image: "https://feyalegria39.org.pe/wp-content/uploads/2025/11/IMG_9178-1300x731.jpg",
    eyebrow: "Control escolar inteligente",
    title: "Acceso ordenado e informacion clara para estudiantes, docentes y familias",
    description:
      "Una portada pensada para orientar desde el primer ingreso y reforzar la identidad del colegio.",
  },
];

const highlights = [
  {
    icon: HeartHandshake,
    title: "Formacion con valores",
    description: "La identidad institucional se refleja en el trato, la cercania y el acompanamiento diario.",
  },
  {
    icon: CalendarCheck2,
    title: "Seguimiento escolar",
    description: "Una plataforma que organiza accesos, control de asistencia y consulta institucional.",
  },
  {
    icon: Users,
    title: "Comunidad activa",
    description: "Rutas claras para administracion, docentes y familias dentro del sistema.",
  },
];

const roleBands = [
  {
    title: "Administracion",
    description: "Control operativo, consulta rapida y acceso institucional desde una experiencia mas organizada.",
  },
  {
    title: "Docentes",
    description: "Espacios para registrar, revisar y acompanar el proceso escolar con mejor lectura visual.",
  },
  {
    title: "Familias",
    description: "Consulta cercana y comprensible para madres, padres y apoderados dentro de la comunidad escolar.",
  },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0">
          <ImageWithFallback src={currentSlide.image} alt={currentSlide.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(17,17,17,0.66),rgba(17,17,17,0.26)_42%,rgba(207,46,46,0.18)_100%)] dark:bg-[linear-gradient(100deg,rgba(2,6,23,0.78),rgba(15,23,42,0.34)_42%,rgba(127,29,29,0.22)_100%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-[2rem] border border-white/18 bg-black/14 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-8 lg:-ml-6 lg:max-w-[46rem] lg:p-10 xl:-ml-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
              <ShieldCheck className="size-4" />
              {currentSlide.eyebrow}
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              {currentSlide.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/86 sm:text-xl">
              {currentSlide.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                onClick={() => onNavigate("login")}
                className="h-12 rounded-full bg-[#cf2e2e] px-7 text-base text-white hover:bg-[#b72323] dark:bg-[#e54848] dark:hover:bg-[#f25f5f]"
              >
                Acceder al sistema
                <ArrowRight className="size-4" />
              </Button>
              <Button
                onClick={() => onNavigate("about")}
                variant="outline"
                className="h-12 rounded-full border-white/35 bg-white/10 px-7 text-base text-white hover:bg-white hover:text-slate-900 dark:hover:bg-white dark:hover:text-slate-950"
              >
                Conocer la institucion
              </Button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 rounded-full bg-black/10 px-2.5 py-1.5 backdrop-blur-sm">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Ir al slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide ? "w-6 bg-white/90" : "w-2 bg-white/38 hover:bg-white/65"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#fff6f4,#ffffff)] py-14 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,1))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-[1.8rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-slate-900/72 dark:shadow-[0_24px_70px_rgba(2,6,23,0.35)]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ffe4df] text-[#cf2e2e] dark:bg-red-500/10 dark:text-[#ff8a8a]">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[34rem] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1600&q=80"
          alt="Actividad institucional de Fe y Alegria 39"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(207,46,46,0.52),rgba(17,17,17,0.58))] dark:bg-[linear-gradient(110deg,rgba(127,29,29,0.5),rgba(2,6,23,0.78))]" />

        <div className="relative mx-auto flex min-h-[34rem] max-w-7xl items-end px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-[1.8rem] border border-white/14 bg-black/14 p-6 text-white backdrop-blur-md sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/78">Vida escolar y comunidad</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">
              La experiencia educativa tambien se sostiene en momentos compartidos y vida institucional
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              El colegio no solo informa o registra. Tambien transmite identidad, pertenencia y una forma de acompanar
              a su comunidad con mas cercania.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-[rgb(2,6,23)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#cf2e2e] dark:text-[#ff8a8a]">
                Acceso por roles
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
                Una portada mas clara para presentar el sistema desde el primer ingreso
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                La pagina de inicio orienta mejor a cada usuario y presenta el colegio con una composicion mas serena,
                mas legible y mejor conectada con la identidad institucional.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {roleBands.map((role) => (
                <div
                  key={role.title}
                  className="rounded-[1.8rem] bg-[linear-gradient(135deg,#fff0ed,#ffffff)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-[linear-gradient(135deg,rgba(31,26,26,0.92),rgba(15,23,42,0.88))] dark:shadow-[0_24px_70px_rgba(2,6,23,0.35)]"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#cf2e2e] dark:text-[#ff8a8a]">
                    {role.title}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] bg-[#1f1a1a] p-7 text-white shadow-[0_18px_50px_rgba(31,26,26,0.14)] dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(2,6,23,0.35)]">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold">Acceso ordenado</h3>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Rutas claras para administracion, docentes y familias dentro de una experiencia visual mas confiable.
              </p>
            </article>

            <article className="rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-slate-900/72 dark:shadow-[0_24px_70px_rgba(2,6,23,0.35)]">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#ffe4df] text-[#cf2e2e] dark:bg-red-500/10 dark:text-[#ff8a8a]">
                <BookOpen className="size-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">Identidad del colegio</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Una primera impresion mas fuerte, con imagenes amplias, mejor lectura visual y una atmosfera mas institucional.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
