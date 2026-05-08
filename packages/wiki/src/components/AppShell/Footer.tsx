
export const Footer = () => {
  return (
    <footer class="px-4 py-2 md:ml-64 border-t border-zinc-800 text-gray-400">
      <div class="flex w-full items-center flex-col flex-nowrap items-center items-center">
        <div>Version: {_GIT_COMMIT_HASH_}</div>
        <div>
          Made by&nbsp;
          <a class="underline" href="https://misaliu.top" target="_blank">Misa Liu</a>&nbsp;
          &&nbsp;
          <a class="underline" href="https://github.com/MisaLiu/manosaba-wiki/graphs/contributors" target="_blank">Other contributors</a>.&nbsp;
          <a class="underline" href="https://github.com/MisaLiu/manosaba-wiki">View source code</a>
        </div>
        <div>
          Not affiliated with Mojang, Microsoft and ACACIA.
        </div>
        <div>
          Special thanks:&nbsp;
          <a class="underline" href="https://vite.dev/" target="_blank">Vite</a> /&nbsp;
          <a class="underline" href="https://preactjs.com/" target="_blank">Preact</a> /&nbsp;
          <a class="underline" href="https://unocss.dev/" target="_blank">UnoCSS</a> /&nbsp;
          <a class="underline" href="https://mcasset.cloud/1.21.10/" target="_blank">mcasset.cloud</a>
        </div>
      </div>
    </footer>
  );
};
