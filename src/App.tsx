import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Menu, Minus, Plus, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Service = {
  number: string;
  title: string;
  summary: string;
  detail: string;
  includes: string[];
};

type ProjectCategory = "Urbanización" | "Redes de servicios" | "Riego";

type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  service: string;
  image: string;
  alt: string;
  summary: string;
  scope: string[];
};

type ContactForm = {
  name: string;
  email: string;
  organization: string;
  service: string;
  message: string;
};

const services: Service[] = [
  {
    number: "01",
    title: "Urbanización integral",
    summary: "Del terreno a un lugar listo para crecer.",
    detail:
      "Transformamos suelo en espacios conectados, funcionales y pensados para las personas. Acompañamos el desarrollo desde el trazado inicial hasta la ejecución de cada obra.",
    includes: ["Movimiento de suelos", "Calles y accesos", "Espacios públicos"],
  },
  {
    number: "02",
    title: "Redes de servicios",
    summary: "La infraestructura invisible que hace posible todo lo demás.",
    detail:
      "Diseñamos y ejecutamos las redes que dan vida a cada proyecto, articulando soluciones técnicas con las necesidades reales de cada territorio.",
    includes: ["Agua y saneamiento", "Desagües", "Coordinación de instalaciones"],
  },
  {
    number: "03",
    title: "Infraestructura de riego",
    summary: "Agua bien gestionada para proyectos que perduran.",
    detail:
      "Desarrollamos soluciones de conducción y distribución de agua que mejoran el aprovechamiento de los recursos y acompañan el crecimiento productivo.",
    includes: ["Sistemas de conducción", "Distribución de agua", "Soluciones eficientes"],
  },
  {
    number: "04",
    title: "Gestión integral de proyectos",
    summary: "Una mirada completa, de la idea a la obra terminada.",
    detail:
      "Integramos planificación, coordinación y seguimiento para que cada etapa avance con claridad. Un solo equipo, una visión compartida y decisiones bien acompañadas.",
    includes: ["Planificación", "Coordinación técnica", "Seguimiento de obra"],
  },
];

const projects: Project[] = [
  {
    id: "01",
    title: "Un nuevo lugar para vivir",
    category: "Urbanización",
    service: "Urbanización integral",
    image: "./images/obra-urbanizacion.jpg",
    alt: "Vista aérea de calles curvas y espacios verdes en un desarrollo residencial",
    summary:
      "Un desarrollo pensado desde el terreno: calles, conexiones y espacios compartidos que le dan forma a una nueva comunidad.",
    scope: ["Trazado y apertura de calles", "Preparación del terreno", "Integración de espacios verdes"],
  },
  {
    id: "02",
    title: "Conexiones que hacen ciudad",
    category: "Redes de servicios",
    service: "Redes de servicios",
    image: "./images/obra-redes.jpg",
    alt: "Instalación de cañerías y conducciones en una obra de infraestructura",
    summary:
      "Redes esenciales proyectadas para acompañar el presente y preparar el crecimiento futuro de un área urbana.",
    scope: ["Tendido de redes de agua", "Conducciones y desagües", "Coordinación de instalaciones"],
  },
  {
    id: "03",
    title: "Agua para seguir creciendo",
    category: "Riego",
    service: "Infraestructura de riego",
    image: "./images/obra-riego.jpg",
    alt: "Campos productivos con canales de riego vistos desde el aire",
    summary:
      "Infraestructura que acerca el agua a donde genera valor, con una mirada eficiente y respetuosa del paisaje.",
    scope: ["Conducción de agua", "Distribución para riego", "Adaptación al entorno productivo"],
  },
  {
    id: "04",
    title: "Caminos hacia nuevas posibilidades",
    category: "Urbanización",
    service: "Urbanización integral",
    image: "./images/obra-accesos.jpg",
    alt: "Camino de acceso curvo integrado con el paisaje de un desarrollo urbano",
    summary:
      "Accesos e infraestructura vial que conectan un nuevo desarrollo con su entorno de manera natural.",
    scope: ["Diseño de accesos", "Infraestructura vial", "Articulación con el paisaje"],
  },
];

const filters = ["Todas", "Urbanización", "Redes de servicios", "Riego"] as const;
type ProjectFilter = (typeof filters)[number];

const initialForm: ContactForm = {
  name: "",
  email: "",
  organization: "",
  service: "",
  message: "",
};

// Reemplazar por el correo oficial de Penicó antes de publicar el sitio.
const CONTACT_EMAIL = "contacto@penico.com.ar";

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 3.5C35.4 3.5 44.5 12.6 44.5 24S35.4 44.5 24 44.5 3.5 35.4 3.5 24 12.6 3.5 24 3.5Z"
        fill="currentColor"
      />
      <path
        d="M10.5 27.5C16.8 16.5 24.3 17 29.2 24.2C32.2 28.5 35.7 28.1 39.3 21.5"
        stroke="#F5F1E9"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M11.8 34.1C18.6 26.7 25.2 28.1 29.6 33.1C32.4 36.3 35.5 35.1 38.7 31.4"
        stroke="#F5F1E9"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function App() {
  const pageRef = useRef<HTMLDivElement>(null);
  const projectGridRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const firstFilterRender = useRef(true);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openService, setOpenService] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("Todas");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [preparedMailto, setPreparedMailto] = useState("");

  const visibleProjects =
    activeFilter === "Todas" ? projects : projects.filter((project) => project.category === activeFilter);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 30);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!menuOpen && !selectedProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, selectedProject]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        ".header-inner",
        { autoAlpha: 0, y: -16 },
        { autoAlpha: 1, y: 0, duration: 0.85, delay: 0.1, ease: "power3.out" },
      );

      gsap.fromTo(
        ".hero-animate",
        { autoAlpha: 0, y: 38 },
        { autoAlpha: 1, y: 0, duration: 1, delay: 0.25, stagger: 0.12, ease: "power3.out" },
      );

      gsap.to(".hero-photo", {
        scale: 1.14,
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 35 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });
    }, pageRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (firstFilterRender.current) {
      firstFilterRender.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = projectGridRef.current?.querySelectorAll(".project-item");
    if (!items?.length) return;
    gsap.fromTo(items, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.5, ease: "power2.out" });
  }, [activeFilter]);

  useEffect(() => {
    if (!selectedProject) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => dialogCloseRef.current?.focus());

    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleDialogKeys);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && dialogRef.current) {
      gsap.fromTo(dialogRef.current, { autoAlpha: 0, y: 25, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" });
    }

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleDialogKeys);
      previousFocus?.focus();
    };
  }, [selectedProject]);

  const goToContact = (service: string) => {
    setForm((current) => ({ ...current, service }));
    setPreparedMailto("");
    setSelectedProject(null);
    setMenuOpen(false);
    window.setTimeout(() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  const updateForm = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = `Consulta por proyecto - ${form.service}`;
    const body = [
      "Hola Penicó,",
      "",
      form.message,
      "",
      `Nombre: ${form.name}`,
      `Correo: ${form.email}`,
      `Organización: ${form.organization || "No indicada"}`,
      `Tipo de proyecto: ${form.service}`,
    ].join("\n");
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setPreparedMailto(mailto);
    window.location.href = mailto;
  };

  return (
    <div ref={pageRef} className="site-wrap">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className={`site-header ${scrolled || menuOpen ? "is-solid" : ""}`}>
        <div className="header-inner container-main flex h-full items-center justify-between gap-6">
          <a className="brand flex shrink-0 items-center gap-2.5" href="#inicio" aria-label="Penicó, ir al inicio" onClick={() => setMenuOpen(false)}>
            <BrandMark className="brand-mark h-9 w-9" />
            <span className="brand-word">penicó<span className="brand-period">.</span></span>
          </a>

          <nav className="desktop-nav hidden items-center gap-9 lg:flex" aria-label="Navegación principal">
            <a href="#servicios">Servicios</a>
            <a href="#obras">Obras</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#metodo">Cómo trabajamos</a>
          </nav>

          <a className="header-contact hidden items-center gap-3 lg:inline-flex" href="#contacto">
            Hablemos <ArrowUpRight size={17} strokeWidth={1.8} />
          </a>

          <button
            className="menu-toggle inline-flex items-center justify-center lg:hidden"
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "mobile-navigation" : undefined}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={27} strokeWidth={1.7} /> : <Menu size={27} strokeWidth={1.7} />}
          </button>
        </div>

        {menuOpen && (
          <nav id="mobile-navigation" className="mobile-nav lg:hidden" aria-label="Navegación móvil">
            <a href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
            <a href="#obras" onClick={() => setMenuOpen(false)}>Obras</a>
            <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a>
            <a href="#metodo" onClick={() => setMenuOpen(false)}>Cómo trabajamos</a>
            <a className="mobile-nav-contact" href="#contacto" onClick={() => setMenuOpen(false)}>
              Hablemos de tu proyecto <ArrowUpRight size={21} />
            </a>
          </nav>
        )}
      </header>

      <main id="contenido">
        <section className="hero relative isolate flex items-center overflow-hidden" id="inicio" aria-labelledby="hero-title">
          <div className="hero-media absolute inset-0 -z-20 overflow-hidden">
            <img className="hero-photo absolute inset-0 h-full w-full object-cover" src="./images/hero-urbanizacion.jpg" alt="Vista aérea de un desarrollo urbano entre calles curvas, árboles y paisaje natural" fetchPriority="high" />
          </div>
          <div className="hero-shade absolute inset-0 -z-10" />

          <div className="container-main hero-content relative z-10 w-full">
            <div className="hero-copy">
              <p className="hero-animate hero-kicker">DESARROLLO URBANO E INFRAESTRUCTURA</p>
              <h1 className="hero-animate hero-title" id="hero-title">penicó<span>.</span></h1>
              <p className="hero-animate hero-statement">Hacemos lugar<br />para <em>lo que viene.</em></p>
              <p className="hero-animate hero-description">
                Pensamos, proyectamos y construimos la infraestructura que transforma espacios en posibilidades.
              </p>
              <div className="hero-animate hero-actions flex flex-wrap items-center gap-x-8 gap-y-5">
                <a className="button-primary" href="#contacto">
                  Hablemos de tu proyecto <ArrowUpRight size={19} strokeWidth={1.8} />
                </a>
                <a className="hero-text-link" href="#servicios">
                  Conocé lo que hacemos <ArrowDown size={17} strokeWidth={1.8} />
                </a>
              </div>
            </div>
          </div>

          <svg className="hero-wave absolute bottom-[-1px] left-0 z-10 w-full" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 67C178 13 366 22 554 51C766 84 902 103 1089 57C1216 26 1347 28 1440 50V110H0V67Z" fill="#F5F1E9" />
          </svg>
        </section>

        <section className="services-section section-pad" id="servicios" aria-labelledby="services-title">
          <div className="container-main">
            <div className="section-heading-grid mb-16 grid gap-8 lg:grid-cols-[1.45fr_0.55fr] lg:items-end lg:gap-20">
              <div data-reveal>
                <p className="eyebrow"><span className="eyebrow-line" /> 01 / QUÉ HACEMOS</p>
                <h2 className="section-title max-w-[790px]" id="services-title">
                  Soluciones para cada parte <em>del camino.</em>
                </h2>
              </div>
              <p className="section-intro max-w-[370px] lg:pb-3" data-reveal>
                De la primera idea a la obra concreta, nos involucramos en cada etapa para que tu proyecto avance con una base sólida.
              </p>
            </div>

            <div className="services-list" data-reveal>
              {services.map((service, index) => {
                const isOpen = openService === index;
                return (
                  <div className={`service-row ${isOpen ? "is-open" : ""}`} key={service.number}>
                    <h3>
                      <button
                        className="service-trigger w-full text-left"
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`service-detail-${index}`}
                        onClick={() => setOpenService(isOpen ? null : index)}
                      >
                        <span className="service-number">{service.number}</span>
                        <span className="service-name">{service.title}</span>
                        <span className="service-summary">{service.summary}</span>
                        <span className="service-toggle" aria-hidden="true">
                          {isOpen ? <Minus size={21} strokeWidth={1.6} /> : <Plus size={21} strokeWidth={1.6} />}
                        </span>
                      </button>
                    </h3>
                    <div className="service-detail" id={`service-detail-${index}`} aria-hidden={!isOpen}>
                      <div className="service-detail-inner">
                        <div className="service-detail-content">
                          <p>{service.detail}</p>
                          <div className="service-includes" aria-label="Incluye">
                            {service.includes.map((item) => <span key={item}>{item}</span>)}
                          </div>
                          <button className="text-action" type="button" onClick={() => goToContact(service.title)} tabIndex={isOpen ? 0 : -1}>
                            Consultar por este servicio <ArrowUpRight size={18} strokeWidth={1.8} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="works-section" id="obras" aria-labelledby="works-title">
          <div className="container-main relative z-10">
            <div className="section-heading-grid grid gap-8 lg:grid-cols-[1.45fr_0.55fr] lg:items-end lg:gap-20">
              <div data-reveal>
                <p className="eyebrow eyebrow-light"><span className="eyebrow-line" /> 02 / OBRAS DESTACADAS</p>
                <h2 className="section-title section-title-light max-w-[800px]" id="works-title">
                  Ideas que ya son <em>parte del paisaje.</em>
                </h2>
              </div>
              <p className="section-intro section-intro-light max-w-[370px] lg:pb-3" data-reveal>
                Cada proyecto es distinto. En todos buscamos lo mismo: hacer que el territorio y las personas crezcan juntos.
              </p>
            </div>

            <div className="project-filters mt-14 flex flex-wrap gap-x-8 gap-y-3" role="group" aria-label="Filtrar obras por tipo" data-reveal>
              {filters.map((filter) => (
                <button
                  className={`project-filter ${activeFilter === filter ? "is-active" : ""}`}
                  type="button"
                  key={filter}
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="project-grid mt-10 grid gap-x-10 gap-y-14 md:grid-cols-2" ref={projectGridRef} data-reveal aria-live="polite">
              {visibleProjects.map((project) => (
                <button className="project-item group block w-full text-left" type="button" key={project.id} onClick={() => setSelectedProject(project)} aria-label={`Ver detalle de ${project.title}`}>
                  <div className="project-image-wrap relative overflow-hidden">
                    <img src={project.image} alt={project.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]" />
                  </div>
                  <div className="project-caption mt-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="project-category">{project.category} <span aria-hidden="true">/</span> {project.id}</p>
                      <h3>{project.title}</h3>
                    </div>
                    <span className="project-arrow shrink-0" aria-hidden="true"><ArrowUpRight size={22} strokeWidth={1.6} /></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <svg className="works-wave absolute bottom-[-1px] left-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 54C248 94 430 14 682 42C917 68 1081 95 1440 30V100H0V54Z" fill="#F5F1E9" />
          </svg>
        </section>

        <section className="about-section section-pad" id="nosotros" aria-labelledby="about-title">
          <div className="container-main about-layout grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-[10%]">
            <div className="about-image-frame relative" data-reveal>
              <img src="./images/equipo-territorio.jpg" alt="Profesionales conversan sobre un plano en el terreno de un futuro proyecto" loading="lazy" className="about-image h-full w-full object-cover" />
            </div>
            <div className="about-copy" data-reveal>
              <p className="eyebrow"><span className="eyebrow-line" /> 03 / SOBRE NOSOTROS</p>
              <h2 className="section-title" id="about-title">Primero entendemos el lugar. Después, <em>lo transformamos.</em></h2>
              <p className="about-lead">Somos un equipo que cree que una buena obra comienza mucho antes de construir.</p>
              <p className="about-body">
                Escuchamos a quienes imaginan el proyecto, estudiamos el territorio y encontramos la mejor manera de hacerlo realidad. Combinamos mirada técnica, compromiso y cercanía en cada decisión.
              </p>
              <a className="text-action about-link" href="#metodo">Así trabajamos <ArrowRight size={19} strokeWidth={1.8} /></a>
            </div>
          </div>
        </section>

        <section className="method-section" id="metodo" aria-labelledby="method-title">
          <div className="container-main">
            <div className="section-heading-grid grid gap-8 lg:grid-cols-[1.45fr_0.55fr] lg:items-end lg:gap-20">
              <div data-reveal>
                <p className="eyebrow"><span className="eyebrow-line" /> 04 / CÓMO TRABAJAMOS</p>
                <h2 className="section-title max-w-[770px]" id="method-title">Un camino claro, <em>de principio a fin.</em></h2>
              </div>
              <p className="section-intro max-w-[380px] lg:pb-3" data-reveal>
                Nos sumamos como aliados. Ordenamos la complejidad y cuidamos cada paso para que la visión se convierta en una obra posible.
              </p>
            </div>

            <div className="method-steps mt-16 grid gap-9 md:grid-cols-3 md:gap-10">
              <div className="method-step" data-reveal>
                <span className="method-number">01</span>
                <div className="method-rule" />
                <h3>Escuchamos<br />y estudiamos</h3>
                <p>Conocemos tu idea y leemos el territorio para encontrar el punto de partida correcto.</p>
              </div>
              <div className="method-step" data-reveal>
                <span className="method-number">02</span>
                <div className="method-rule" />
                <h3>Planificamos<br />con criterio</h3>
                <p>Integramos técnica, tiempos y recursos en una propuesta a medida de cada desafío.</p>
              </div>
              <div className="method-step" data-reveal>
                <span className="method-number">03</span>
                <div className="method-rule" />
                <h3>Hacemos<br />que suceda</h3>
                <p>Coordinamos y ejecutamos con atención al detalle, de la primera tarea al último tramo.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section relative overflow-hidden" id="contacto" aria-labelledby="contact-title">
          <div className="contact-contour absolute left-[-160px] top-[55px]" aria-hidden="true" />
          <div className="container-main contact-layout relative z-10 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-[11%]">
            <div className="contact-copy" data-reveal>
              <p className="eyebrow eyebrow-light"><span className="eyebrow-line" /> 05 / HABLEMOS</p>
              <h2 className="section-title section-title-light" id="contact-title">Lo que viene empieza <em>con una conversación.</em></h2>
              <p>Contanos qué tenés en mente. Nos interesa conocer tu proyecto y pensar juntos el próximo paso.</p>
              <div className="contact-signature flex items-center gap-3">
                <BrandMark className="h-9 w-9 text-[#B86D41]" />
                <span>Estamos para escucharte.</span>
              </div>
            </div>

            <div className="contact-form-area" data-reveal>
              {preparedMailto ? (
                <div className="contact-success" role="status" aria-live="polite">
                  <div className="success-icon"><Check size={31} strokeWidth={1.6} /></div>
                  <h3>Tu consulta está lista.</h3>
                  <p>Preparamos un correo con tu mensaje. Revisalo y envialo para completar la consulta. Si no se abrió tu aplicación, podés intentarlo de nuevo.</p>
                  <a className="success-link" href={preparedMailto}>Abrir el correo otra vez <ArrowUpRight size={18} /></a>
                  <button className="success-reset" type="button" onClick={() => setPreparedMailto("")}>Editar mi consulta</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-grid grid gap-x-7 gap-y-8 sm:grid-cols-2">
                    <div className="form-field">
                      <label htmlFor="contact-name">Tu nombre <span>*</span></label>
                      <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="¿Cómo te llamás?" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required />
                    </div>
                    <div className="form-field">
                      <label htmlFor="contact-email">Tu correo <span>*</span></label>
                      <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="nombre@organizacion.com" value={form.email} onChange={(event) => updateForm("email", event.target.value)} required />
                    </div>
                    <div className="form-field">
                      <label htmlFor="contact-organization">Organización</label>
                      <input id="contact-organization" name="organization" type="text" autoComplete="organization" placeholder="Empresa o institución" value={form.organization} onChange={(event) => updateForm("organization", event.target.value)} />
                    </div>
                    <div className="form-field">
                      <label htmlFor="contact-service">Tipo de proyecto <span>*</span></label>
                      <select id="contact-service" name="service" value={form.service} onChange={(event) => updateForm("service", event.target.value)} required>
                        <option value="" disabled>Seleccioná una opción</option>
                        {services.map((service) => <option key={service.number} value={service.title}>{service.title}</option>)}
                        <option value="Otro proyecto">Otro proyecto</option>
                      </select>
                    </div>
                    <div className="form-field sm:col-span-2">
                      <label htmlFor="contact-message">Contanos sobre tu proyecto <span>*</span></label>
                      <textarea id="contact-message" name="message" rows={4} placeholder="¿Qué te gustaría hacer posible?" value={form.message} onChange={(event) => updateForm("message", event.target.value)} required />
                    </div>
                  </div>
                  <div className="form-bottom mt-8 flex flex-wrap items-center justify-between gap-5">
                    <p>Se abrirá tu correo para terminar el envío.</p>
                    <button className="button-submit" type="submit">Enviar consulta <ArrowUpRight size={19} strokeWidth={1.8} /></button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container-main">
          <div className="footer-main flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <div>
              <a className="brand footer-brand flex w-fit items-center gap-2.5" href="#inicio" aria-label="Penicó, volver al inicio">
                <BrandMark className="brand-mark h-10 w-10" />
                <span className="brand-word">penicó<span className="brand-period">.</span></span>
              </a>
              <p>Hacemos lugar para lo que viene.</p>
            </div>
            <a className="back-to-top flex w-fit items-center gap-3" href="#inicio">Volver arriba <ArrowUpRight size={19} strokeWidth={1.7} /></a>
          </div>
          <div className="footer-bottom flex flex-col justify-between gap-2 sm:flex-row">
            <span>© {new Date().getFullYear()} Penicó. Desarrollo urbano e infraestructura.</span>
            <span>Hecho para construir futuro.</span>
          </div>
        </div>
      </footer>

      {selectedProject && (
        <div className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedProject(null);
        }}>
          <div className="project-dialog relative grid w-full max-w-[1120px] overflow-y-auto lg:grid-cols-[1.04fr_0.96fr]" role="dialog" aria-modal="true" aria-labelledby="dialog-title" ref={dialogRef}>
            <button className="dialog-close absolute right-5 top-5 z-10 flex items-center justify-center" type="button" aria-label="Cerrar detalle de obra" onClick={() => setSelectedProject(null)} ref={dialogCloseRef}>
              <X size={22} strokeWidth={1.7} />
            </button>
            <div className="dialog-image-wrap min-h-[260px] lg:min-h-full">
              <img className="h-full w-full object-cover" src={selectedProject.image} alt={selectedProject.alt} />
            </div>
            <div className="dialog-copy flex flex-col justify-center">
              <p className="eyebrow"><span className="eyebrow-line" /> OBRA {selectedProject.id} / {selectedProject.category.toUpperCase()}</p>
              <h2 id="dialog-title">{selectedProject.title}</h2>
              <p className="dialog-summary">{selectedProject.summary}</p>
              <div className="dialog-scope">
                <p>ALCANCE DEL PROYECTO</p>
                <ul>
                  {selectedProject.scope.map((item) => <li key={item}><Check size={17} strokeWidth={1.8} /> {item}</li>)}
                </ul>
              </div>
              <button className="dialog-action" type="button" onClick={() => goToContact(selectedProject.service)}>
                Hablemos de un proyecto similar <ArrowUpRight size={19} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
