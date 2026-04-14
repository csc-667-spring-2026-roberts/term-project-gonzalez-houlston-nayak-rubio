document.addEventListener("DOMContentLoaded", (): void => {
  const btn = document.getElementById("fetch-players-btn") as HTMLButtonElement | null;
  const list = document.getElementById("player-list") as HTMLUListElement | null;
  const tmpl = document.getElementById("player-template") as HTMLTemplateElement | null;

  btn?.addEventListener("click", (): void => {
    void (async (): Promise<void> => {
      const res = await fetch("/lobby/players");
      const data = (await res.json()) as {
        players: Array<{ id: number; email: string }>;
      };

      if (!list || !tmpl) return;

      list.replaceChildren();

      for (const player of data.players) {
        const clone = tmpl.content.cloneNode(true) as DocumentFragment;
        const emailSpan = clone.querySelector("[data-field='email']");
        if (emailSpan) emailSpan.textContent = player.email;
        list.appendChild(clone);
      }
    })();
  });
});
