// ONG Canto da Terra — interações em JavaScript puro

const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  menuToggle.textContent = isOpen ? "×" : "☰";
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) {
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-label", "Abrir menu");
    }
  });
});

// Favoritos demonstrativos nos cards de adoção.
document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const isFavorite = button.classList.toggle("is-favorite");
    button.textContent = isFavorite ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(isFavorite));
  });
});


// Validação da interface do formulário de contato.
const contactForm = document.querySelector("#contactForm");
const toast = document.querySelector("#toast");
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 4500);
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  const name = document.querySelector("#name").value.trim();
  showToast(`Obrigado, ${name}! Esta é uma demonstração: a mensagem não foi enviada.`);
  contactForm.reset();
});


// Formulários separados: consulta, castração e interesse em adoção.
document.querySelectorAll(".appointment-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const person = form.querySelector('input[name="nome"]')?.value.trim() || "Olá";
    let message = "Seu formulário foi preenchido com sucesso.";
    if (form.id === "form-consulta") message = `Obrigado, ${person}! Sua solicitação de consulta foi preenchida.`;
    if (form.id === "form-castracao") message = `Obrigado, ${person}! Sua solicitação de castração foi preenchida.`;
    if (form.id === "form-adocao") message = `Obrigado, ${person}! Seu interesse foi preenchido nesta demonstração, sem envio de dados.`;
    showToast(`${message} Nenhum dado foi enviado.`);
    form.reset();
  });
});

// Impede a seleção de datas passadas nos formulários de agendamento.
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
document.querySelectorAll('input[type="date"]').forEach((dateInput) => {
  dateInput.min = localToday;
});


// Exibe somente o formulário escolhido; os demais permanecem recolhidos.
document.querySelectorAll("[data-open-form]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const targetId = trigger.dataset.openForm;
    const target = document.getElementById(targetId);
    if (!target) return;

    document.querySelectorAll(".appointment-form, #contactForm").forEach((form) => {
      form.hidden = true;
    });

    target.hidden = false;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    const firstField = target.querySelector("input, select, textarea");
    firstField?.focus({ preventScroll: true });
  });
});

document.querySelectorAll("[data-close-form]").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest("form");
    if (form) {
      form.hidden = true;
      const section = form.closest("section");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});


// Ao escolher um animal, abre o formulário de adoção já preenchido com seu nome.
document.querySelectorAll(".adoption-interest").forEach((button) => {
  button.addEventListener("click", () => {
    const form = document.querySelector("#form-adocao");
    const animalSelect = document.querySelector("#adocaoAnimal");
    const animalName = button.dataset.animal;
    if (!form || !animalSelect) return;

    document.querySelectorAll(".appointment-form, #contactForm").forEach((item) => {
      item.hidden = true;
    });

    animalSelect.value = animalName;
    const intro = document.querySelector("#adoptionFormIntro");
    if (intro) intro.textContent = `Você demonstrou interesse em adotar ${animalName}. Preencha seus dados para continuar.`;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.querySelector('input[name="nome"]')?.focus({ preventScroll: true });
  });
});

// Consulta pública de CEP (ViaCEP): exemplo de consumo de API exigido no projeto.
const cepInput = document.querySelector('#cep');
const buscarCepButton = document.querySelector('#buscarCep');

buscarCepButton?.addEventListener('click', async () => {
  const cep = (cepInput?.value || '').replace(/\D/g, '');
  if (!/^\d{8}$/.test(cep)) {
    showToast('Informe um CEP válido com 8 números.');
    cepInput?.focus();
    return;
  }

  buscarCepButton.disabled = true;
  buscarCepButton.textContent = 'Consultando...';
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error('Falha na consulta');
    const data = await response.json();
    if (data.erro) throw new Error('CEP não encontrado');
    document.querySelector('#logradouro').value = data.logradouro || '';
    document.querySelector('#bairro').value = data.bairro || '';
    document.querySelector('#cidade').value = [data.localidade, data.uf].filter(Boolean).join(' - ');
    showToast('Endereço localizado pelo CEP.');
  } catch (error) {
    showToast(error.message === 'CEP não encontrado' ? error.message : 'Não foi possível consultar o CEP. Tente novamente.');
  } finally {
    buscarCepButton.disabled = false;
    buscarCepButton.textContent = 'Consultar CEP';
  }
});

cepInput?.addEventListener('input', () => {
  const digits = cepInput.value.replace(/\D/g, '').slice(0, 8);
  cepInput.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
});
