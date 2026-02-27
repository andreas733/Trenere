import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Resource = {
  title: string;
  href: string;
};

type Section = {
  title: string;
  description: string;
  links: Resource[];
};

const SECTIONS: Section[] = [
  {
    title: "Antidoping",
    description:
      "Opplæring og informasjon er en viktig grunnpilar i antidopingarbeidet. Ren Utøver er et e-læringsprogram for trenere og utøvere. Antidoping Norge har også informasjon om seminarer, Rent Idrettslag og dopinglista.",
    links: [
      { title: "Ren Utøver", href: "https://www.renutover.no" },
      { title: "Antidoping Norge", href: "https://antidoping.no" },
      {
        title: "NSF antidoping",
        href: "https://svomming.no/forbundet/antidoping/",
      },
    ],
  },
  {
    title: "Basistrening",
    description:
      "Norges Svømmeforbund har utviklet en utviklingstrapp for basistrening i samarbeid med Bærumsvømmerne og Olympiatoppen. Øvelsene dekker bevegelighet, holdning/linjer og stabilitet/rotasjon.",
    links: [
      {
        title: "Olympiatoppen – Utviklingstrapp svømming",
        href: "https://www.olympiatoppen.no/fagomraader/trening/utviklingstrapper/svomming/page2099.html",
      },
      {
        title: "Kjernemuskulatur",
        href: "https://www.olympiatoppen.no/fagomraader/trening/styrke/fagstoff/kjernemuskulatur/page5298.html",
      },
    ],
  },
  {
    title: "Female Athlete Health",
    description:
      "IOC har laget et interaktivt læringsprogram med fokus på Female Athlete Health – ernæring, skader, graviditet, menstruasjon og mer. Nyttig for trenere og utøvere.",
    links: [
      {
        title: "IOC Female Athlete Health",
        href: "https://www.olympicresources.com/Home/Welcome",
      },
    ],
  },
  {
    title: "Kosthold",
    description:
      "Ernæringsråd for idrettsutøvere. Olympiatoppen, Sunn Idrett og SEF har fagstoff og veiledning om kosthold i forhold til trening og konkurranse.",
    links: [
      {
        title: "Olympiatoppen ernæring",
        href: "https://www.olympiatoppen.no/fagomraader/idrettsernaering/page1016.html",
      },
      { title: "Sunn Idrett", href: "https://www.sunnidrett.no" },
    ],
  },
  {
    title: "Skadeforebygging",
    description:
      "NSF har samarbeidet med Senter for idrettsskadeforskning om kompendium og filmer om typiske skader i skulder, kne og rygg, samt forebygging.",
    links: [
      {
        title: "Skadefri.no – Svømming",
        href: "https://www.skadefri.no/idretter/svomming/",
      },
    ],
  },
  {
    title: "Treningsdagbok",
    description:
      "Svømmelandslaget bruker treningsdagboken Bestr, og NSF anbefaler den for alle svømmere som har et mål med treningen.",
    links: [{ title: "Bestr", href: "https://www.bestr.no" }],
  },
  {
    title: "Utviklingstrapp",
    description:
      "NSFs utviklingstrapp for svømming beskriver den sportslige utviklingen fra grunnleggende ferdigheter til toppnivå.",
    links: [
      {
        title: "NSF utviklingstrapp svømming",
        href: "https://svomming.no/svomming/svomming-forside/utviklingstrapp/",
      },
    ],
  },
  {
    title: "Trenernettverk for kvinner",
    description:
      "Er du kvinnelig trener? Bli med i trenernettverket for utvidet nettverk, inspirasjon og motivasjon.",
    links: [
      {
        title: "Facebook-gruppe",
        href: "https://www.facebook.com/groups/185387448853598",
      },
      {
        title: "Instagram",
        href: "https://www.instagram.com/trenernettverk_for_kvinner_nsf/",
      },
    ],
  },
  {
    title: "Sportslig plan",
    description:
      "NSF har laget veiledningshefte for å utvikle en sportslig plan. Virksomhetsplan og sportslig plan er grunnlaget for klubbens sportslige utvikling.",
    links: [
      {
        title: "NSF sportslig plan svømming",
        href: "https://svomming.no/svomming/svomming-forside/sportslig-plan-svomming/",
      },
    ],
  },
];

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ssk-blue underline hover:text-ssk-800"
    >
      {children}
    </a>
  );
}

export default async function MinSideLandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">
        For trenere
      </h1>
      <p className="mb-8 text-slate-600">
        Informasjon, tips og lenker fra Norges Svømmeforbund som er aktuelle for
        trenere innen svømmeidrettene.{" "}
        <ExternalLink href="https://svomming.no/forbundet/for-trenere/">
          Les mer på NSF
        </ExternalLink>
      </p>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-2 font-semibold text-slate-800">
              {section.title}
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              {section.description}
            </p>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href}>{link.title}</ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
