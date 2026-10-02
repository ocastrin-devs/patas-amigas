/* Patas Amigas – site de adoção acessível */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const raiz = document.documentElement;

/* ---------- Animais (edite aqui; use "foto" para colocar uma imagem real) ---------- */
const animais = [
  { id: "thor", nome: "Thor", especie: "cachorro", sexo: "Macho", idade: "3 anos", porte: "Médio", energia: "Média",
    cor: "#c98a4b", orelha: "#8a5a2b", detalhe: "Pelo caramelo, focinho escuro e orelhas caídas marrons.",
    historia: "Brincalhão e muito carinhoso. Gosta de passeios curtos e se dá bem com crianças.", foto: "" },
  { id: "mel", nome: "Mel", especie: "cachorro", sexo: "Fêmea", idade: "6 meses", porte: "Pequeno", energia: "Alta",
    cor: "#f1d9a8", orelha: "#d9b46c", detalhe: "Filhote de pelo cor de areia, com uma mancha branca no peito.",
    historia: "Curiosa e cheia de energia. Precisa de paciência para aprender regras da casa.", foto: "" },
  { id: "bento", nome: "Bento", especie: "cachorro", sexo: "Macho", idade: "9 anos", porte: "Médio", energia: "Baixa",
    cor: "#bdbdbd", orelha: "#8c8c8c", detalhe: "Cão idoso de pelo cinza, com o focinho já esbranquiçado.",
    historia: "Tranquilo, adora cochilar ao lado das pessoas. Ótimo para quem busca companhia calma.", foto: "" },
  { id: "luna", nome: "Luna", especie: "gato", sexo: "Fêmea", idade: "2 anos", porte: "Pequeno", energia: "Média",
    cor: "#2e2e33", orelha: "#1c1c20", detalhe: "Gata toda preta, com olhos amarelos bem redondos.",
    historia: "Independente, mas gosta de colo no fim do dia. Convive bem com outros gatos.", foto: "" },
  { id: "mingau", nome: "Mingau", especie: "gato", sexo: "Macho", idade: "1 ano", porte: "Pequeno", energia: "Alta",
    cor: "#f4f4f1", orelha: "#f0b8b8", detalhe: "Gato branco de orelhas rosadas e olhos azuis.",
    historia: "Brincalhão, corre atrás de bolinhas. Vai bem em apartamento com brinquedos.", foto: "" },
  { id: "nina", nome: "Nina", especie: "gato", sexo: "Fêmea", idade: "4 anos", porte: "Pequeno", energia: "Baixa",
    cor: "#a8a49c", orelha: "#7a766e", detalhe: "Gata cinza com listras escuras (tigrada) e olhos verdes.",
    historia: "Tímida no começo, depois muito dengosa. Prefere ambientes silenciosos.", foto: "" }
];
const nomeEspecie = { cachorro: "Cachorro", gato: "Gato" };

/* ---------- Preferências de acessibilidade ---------- */
const prefsPadrao = { fonte: 100, contraste: false, calmo: false, legivel: false, espaco: false, links: false, foco: false };
let prefs = { ...prefsPadrao };
try { prefs = { ...prefsPadrao, ...JSON.parse(localStorage.getItem("prefs-a11y") || "{}") }; } catch (e) {}
// Respeita preferências do sistema na primeira visita
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) prefs.calmo = prefs.calmo || false;

function aplicarPrefs() {
  raiz.style.setProperty("--fs", prefs.fonte + "%");
  ["contraste", "calmo", "legivel", "espaco", "links", "foco"].forEach((k) => {
    raiz.dataset[k] = prefs[k] ? "on" : "off";
    const b = $(`[data-pref="${k}"]`);
    if (b) b.setAttribute("aria-pressed", String(prefs[k]));
  });
  try { localStorage.setItem("prefs-a11y", JSON.stringify(prefs)); } catch (e) {}
}

const abrir = $("#a11y-abrir");
const painel = $("#a11y-painel");
function alternarPainel(mostrar) {
  painel.hidden = !mostrar;
  abrir.setAttribute("aria-expanded", String(mostrar));
}
abrir.addEventListener("click", () => alternarPainel(painel.hidden));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !painel.hidden) { alternarPainel(false); abrir.focus(); }
});

painel.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.pref) { prefs[b.dataset.pref] = !prefs[b.dataset.pref]; }
  switch (b.dataset.acao) {
    case "fonte-mais": prefs.fonte = Math.min(160, prefs.fonte + 10); break;
    case "fonte-menos": prefs.fonte = Math.max(80, prefs.fonte - 10); break;
    case "fonte-reset": prefs.fonte = 100; break;
    case "resetar": prefs = { ...prefsPadrao }; break;
  }
  aplicarPrefs();
  if (b.dataset.acao && b.dataset.acao.startsWith("fonte")) aviso(`Tamanho do texto: ${prefs.fonte}%`);
});

/* ---------- Avisos visuais (e lidos por leitor de tela) ---------- */
const toast = $("#voz-aviso");
let timerToast;
function aviso(texto) {
  toast.textContent = texto;
  toast.hidden = false;
  clearTimeout(timerToast);
  timerToast = setTimeout(() => (toast.hidden = true), 4000);
}

/* ---------- Imagens: se falhar, mostra a descrição escrita ---------- */
function ligarFallback(img) {
  const trocar = () => {
    const div = document.createElement("div");
    div.className = "fallback";
    div.setAttribute("role", "img");
    div.setAttribute("aria-label", img.alt);
    div.innerHTML = `<span aria-hidden="true">${img.dataset.fallback || "🐾"}</span><span></span>`;
    div.lastChild.textContent = "Imagem indisponível. Descrição: " + img.alt;
    img.replaceWith(div);
  };
  img.addEventListener("error", trocar, { once: true });
  if (img.complete && img.naturalWidth === 0) trocar();
}
$$("img[data-fallback]").forEach(ligarFallback);

/* ---------- Desenho do bicho (sempre carrega, não depende de internet) ---------- */
function avatar(a) {
  const gato = a.especie === "gato";
  const olho = a.cor === "#2e2e33" ? "#f2c200" : "#222";
  const orelhas = gato
    ? `<polygon points="45,70 55,20 100,55" fill="${a.cor}"/><polygon points="155,70 145,20 100,55" fill="${a.cor}"/>
       <polygon points="55,58 60,34 82,54" fill="${a.orelha}"/><polygon points="145,58 140,34 118,54" fill="${a.orelha}"/>`
    : `<ellipse cx="42" cy="85" rx="20" ry="42" fill="${a.orelha}"/><ellipse cx="158" cy="85" rx="20" ry="42" fill="${a.orelha}"/>`;
  const bigodes = gato
    ? `<g stroke="#555" stroke-width="2"><line x1="55" y1="118" x2="20" y2="112"/><line x1="55" y1="126" x2="20" y2="130"/><line x1="145" y1="118" x2="180" y2="112"/><line x1="145" y1="126" x2="180" y2="130"/></g>`
    : `<path d="M88 138 Q100 150 112 138" stroke="#333" stroke-width="3" fill="none"/>`;
  return `<svg viewBox="0 0 200 160" role="img" aria-label="Desenho ilustrativo: ${a.detalhe}" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="160" fill="#e9dcc6"/>${orelhas}
    <ellipse cx="100" cy="95" rx="55" ry="48" fill="${a.cor}"/>
    <circle cx="80" cy="88" r="7" fill="${olho}"/><circle cx="120" cy="88" r="7" fill="${olho}"/>
    <ellipse cx="100" cy="112" rx="9" ry="6" fill="${gato ? "#d98a8a" : "#222"}"/>${bigodes}</svg>`;
}

/* ---------- Lista de animais ---------- */
const lista = $("#lista");
const contagem = $("#contagem");

function cartao(a) {
  const li = document.createElement("li");
  li.className = "card";
  const descricaoCompleta = `${nomeEspecie[a.especie]}, ${a.sexo.toLowerCase()}, ${a.idade}, porte ${a.porte.toLowerCase()}, energia ${a.energia.toLowerCase()}. ${a.detalhe} ${a.historia}`;
  li.innerHTML = `
    <div class="card__img">${a.foto ? `<img src="${a.foto}" alt="${nomeEspecie[a.especie]} ${a.nome}. ${a.detalhe}" data-fallback="${a.especie === "gato" ? "🐱" : "🐶"}">` : avatar(a)}</div>
    <div class="card__corpo">
      <h3>${a.nome}</h3>
      <ul class="etiquetas" aria-label="Características de ${a.nome}">
        <li>${nomeEspecie[a.especie]}</li><li>${a.sexo}</li><li>${a.idade}</li><li>Porte ${a.porte.toLowerCase()}</li><li>Energia ${a.energia.toLowerCase()}</li>
      </ul>
      <p class="descricao-foto"><strong>Como é:</strong> ${a.detalhe}</p>
      <p>${a.historia}</p>
      <div class="card__acoes">
        <button type="button" data-conhecer="${a.id}" aria-label="Quero conhecer ${a.nome}">Quero conhecer</button>
        <button type="button" class="secundario" data-ouvir="${a.id}" aria-label="Ouvir a descrição de ${a.nome}">🔊 Ouvir</button>
      </div>
    </div>`;
  const img = $("img[data-fallback]", li);
  if (img) ligarFallback(img);
  return li;
}

function renderizar() {
  const filtro = $('input[name="especie"]:checked').value;
  const itens = animais.filter((a) => filtro === "todos" || a.especie === filtro);
  lista.replaceChildren(...itens.map(cartao));
  contagem.textContent = `${itens.length} ${itens.length === 1 ? "animal encontrado" : "animais encontrados"}.`;
}
$$('input[name="especie"]').forEach((r) => r.addEventListener("change", renderizar));

// Opções do formulário
const selectPet = $("#pet");
animais.forEach((a) => selectPet.add(new Option(`${a.nome} (${nomeEspecie[a.especie].toLowerCase()})`, a.id)));

/* ---------- Leitura em voz alta + atalho "Quero conhecer" ---------- */
lista.addEventListener("click", (e) => {
  const c = e.target.closest("[data-conhecer]");
  const o = e.target.closest("[data-ouvir]");
  if (c) {
    selectPet.value = c.dataset.conhecer;
    $("#formulario").scrollIntoView();
    $("#nome").focus();
    aviso("Animal escolhido no formulário. Preencha seus dados.");
  }
  if (o) {
    const a = animais.find((x) => x.id === o.dataset.ouvir);
    if (!("speechSynthesis" in window)) { aviso("Seu navegador não tem leitura em voz alta. Leia o texto do cartão."); return; }
    speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(`${a.nome}. ${nomeEspecie[a.especie]}, ${a.idade}. ${a.detalhe} ${a.historia}`);
    fala.lang = "pt-BR";
    speechSynthesis.speak(fala);
    aviso(`Lendo a descrição de ${a.nome}…`);
  }
});

/* ---------- Formulário: validação com mensagens claras (texto + ícone, nunca só cor) ---------- */
const form = $("#form");
const resumo = $("#resumo-erros");
const sucesso = $("#sucesso");

const regras = {
  nome: (v) => (v.trim().split(/\s+/).filter(Boolean).length < 2 ? "Digite seu nome completo. Exemplo: Maria da Silva." : ""),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Digite um e-mail válido. Exemplo: maria@email.com."),
  telefone: (v) => (v.replace(/\D/g, "").length >= 10 ? "" : "Digite o telefone com DDD. Exemplo: (41) 91234-5678."),
  pet: (v) => (v ? "" : "Escolha o animal que você quer conhecer."),
  moradia: () => (form.moradia.value ? "" : "Escolha se você mora em casa ou apartamento.")
};
const rotulos = { nome: "Nome", email: "E-mail", telefone: "Telefone", pet: "Animal", moradia: "Moradia" };

function validarCampo(nome) {
  const msg = regras[nome](nome === "moradia" ? "" : form[nome].value);
  const erro = $(`#${nome}-erro`);
  erro.textContent = msg;
  erro.hidden = !msg;
  if (nome !== "moradia") form[nome].setAttribute("aria-invalid", String(!!msg));
  return msg;
}

Object.keys(regras).forEach((nome) => {
  if (nome === "moradia") return;
  form[nome].addEventListener("blur", () => form[nome].value !== "" && validarCampo(nome));
  form[nome].addEventListener("input", () => form[nome].getAttribute("aria-invalid") === "true" && validarCampo(nome));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sucesso.hidden = true;
  const erros = Object.keys(regras).map((n) => [n, validarCampo(n)]).filter(([, m]) => m);
  if (erros.length) {
    resumo.innerHTML = `<h3>Há ${erros.length} ${erros.length === 1 ? "campo para corrigir" : "campos para corrigir"}:</h3><ul></ul>`;
    erros.forEach(([n, m]) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = n === "moradia" ? "#moradia-erro" : `#${n}`;
      a.textContent = `${rotulos[n]}: ${m}`;
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        (n === "moradia" ? form.moradia[0] : form[n]).focus();
      });
      li.append(a);
      $("ul", resumo).append(li);
    });
    resumo.hidden = false;
    resumo.focus();
    return;
  }
  resumo.hidden = true;
  const pet = animais.find((a) => a.id === form.pet.value);
  sucesso.textContent = `Pedido enviado! Obrigado, ${form.nome.value.trim().split(" ")[0]}. Vamos falar com você por e-mail ou telefone em até 2 dias úteis sobre ${pet.nome}.`;
  sucesso.hidden = false;
  sucesso.focus();
  form.reset();
  $$("[aria-invalid]", form).forEach((c) => c.removeAttribute("aria-invalid"));
});

aplicarPrefs();
renderizar();