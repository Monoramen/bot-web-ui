import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className=" flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Bot&nbsp;</span>
        <span className={title({ color: "violet" })}>Hub&nbsp;</span>
        <br />
        <span className={title()}>
          для создания и редактирования Telegram-ботов.
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          Удобный инструмент для разработчиков и пользователей.
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href={siteConfig.links.docs}
        >
          Документация
        </Link>
        <Link
          className={buttonStyles({
            color: "secondary",
            radius: "full",
            variant: "filled",
          })}
          href="/login"
        >
          Вход
        </Link>
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
         Начните создавать своего бота
          </span>
        </Snippet>
      </div>
    </section>
  );
}
