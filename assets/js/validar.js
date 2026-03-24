/* ============================================================
   PRISKMAX — validator.js
   Validación de formularios: nombre, email, teléfono Ecuador
   Reutilizable en contacto.html y paquetes.html
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     REGLAS DE VALIDACIÓN
  ══════════════════════════════════════════════════════════ */
  const RULES = {

    nombre: {
      pattern: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]{3,60}$/,
      messages: {
        empty:   'El nombre es obligatorio.',
        short:   'El nombre debe tener al menos 3 caracteres.',
        invalid: 'El nombre solo puede contener letras y espacios.'
      }
    },

    empresa: {
      pattern: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]{3,60}$/,
      messages: {
        empty:   'El nombre de la empresa es obligatorio.',
        short:   'El nombre de la empresa debe tener al menos 3 caracteres.',
        invalid: 'El nombre de la empresa solo puede contener letras y espacios.'
      }
    },

    email: {
      // RFC-compatible: usuario@dominio.extension
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      messages: {
        empty:   'El correo electrónico es obligatorio.',
        invalid: 'Ingresa un correo válido, por ejemplo: nombre@empresa.com'
      }
    },

    telefono: {
      /*
        Acepta los formatos más comunes en Ecuador:
        - 09XXXXXXXX        (celular, 10 dígitos)
        - 02XXXXXXX         (fijo Quito, 9 dígitos)
        - +593 9X XXX XXXX  (internacional con prefijo)
        - +5932XXXXXXX      (fijo internacional)
        Se permiten espacios, guiones y paréntesis como separadores.
      */
      pattern: /^(\+?593[\s-]?)?(0?[2-7]\d{6,7}|09\d{8})$/,
      messages: {
        empty:   'El teléfono es obligatorio.',
        invalid: 'Ingresa un número válido. Ejemplos: 0991234567 · 022345678 · +593 99 123 4567'
      }
    }

  };

  /* ══════════════════════════════════════════════════════════
     MOTOR DE VALIDACIÓN
  ══════════════════════════════════════════════════════════ */

  /**
   * Valida un campo individual.
   * @param {HTMLInputElement} input
   * @param {string} type  — 'nombre' | 'email' | 'telefono'
   * @param {boolean} required
   * @returns {boolean} true si es válido
   */
  function validateField(input, type, required = true) {
    const value = input.value.trim();
    const rule  = RULES[type];
    if (!rule) return true;

    let error = '';

    if (!value) {
      error = required ? rule.messages.empty : '';
    } else if (type === 'nombre' && value.length < 3) {
      error = rule.messages.short;
    } else if (!rule.pattern.test(value)) {
      error = rule.messages.invalid;
    }

    setFieldState(input, error);
    return error === '';
  }

  /**
   * Aplica estado visual (error / éxito) al campo.
   */
  function setFieldState(input, errorMsg) {
    const wrapper = input.closest('.form-group') || input.parentElement;
    let hint = wrapper.querySelector('.field-hint');

    // Crear el elemento de hint si no existe
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'field-hint';
      hint.setAttribute('aria-live', 'polite');
      wrapper.appendChild(hint);
    }

    if (errorMsg) {
      input.classList.add('field-error');
      input.classList.remove('field-ok');
      input.setAttribute('aria-invalid', 'true');
      hint.textContent = '⚠ ' + errorMsg;
      hint.classList.add('hint-error');
      hint.classList.remove('hint-ok');
    } else if (input.value.trim()) {
      input.classList.remove('field-error');
      input.classList.add('field-ok');
      input.setAttribute('aria-invalid', 'false');
      hint.textContent = '✓ Correcto';
      hint.classList.remove('hint-error');
      hint.classList.add('hint-ok');
    } else {
      // Campo vacío sin error (no requerido)
      input.classList.remove('field-error', 'field-ok');
      input.removeAttribute('aria-invalid');
      hint.textContent = '';
    }
  }

  /**
   * Limpia el estado de un campo.
   */
  function clearFieldState(input) {
    input.classList.remove('field-error', 'field-ok');
    input.removeAttribute('aria-invalid');
    const wrapper = input.closest('.form-group') || input.parentElement;
    const hint = wrapper.querySelector('.field-hint');
    if (hint) hint.textContent = '';
  }

  /* ══════════════════════════════════════════════════════════
     ESTILOS DINÁMICOS (se inyectan una sola vez)
  ══════════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('prisk-validator-styles')) return;
    const style = document.createElement('style');
    style.id = 'prisk-validator-styles';
    style.textContent = `
      /* Campo con error */
      .form-control.field-error {
        border-color: #e74c3c !important;
        background: rgba(231, 76, 60, 0.05) !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.12) !important;
      }

      /* Campo válido */
      .form-control.field-ok {
        border-color: var(--green) !important;
        background: rgba(57, 199, 122, 0.04) !important;
      }

      /* Mensaje de hint */
      .field-hint {
        display: block;
        font-size: .75rem;
        margin-top: .3rem;
        min-height: 1rem;
        transition: color .2s;
      }
      .hint-error { color: #e74c3c; }
      .hint-ok    { color: var(--green); }

      /* Shake animation al enviar con errores */
      @keyframes priskShake {
        0%, 100% { transform: translateX(0); }
        20%      { transform: translateX(-6px); }
        40%      { transform: translateX(6px); }
        60%      { transform: translateX(-4px); }
        80%      { transform: translateX(4px); }
      }
      .form-shake { animation: priskShake .4s ease; }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════════════════
     VINCULAR FORMULARIO
     Llama a esta función pasando la configuración del formulario
  ══════════════════════════════════════════════════════════ */

  /**
   * @param {Object} config
   * @param {string}   config.formId       — id del <form>
   * @param {Object[]} config.fields        — array de campos a validar
   *   { inputId, type, required }
   * @param {string}   [config.submitId]   — id del botón submit
   * @param {string}   [config.statusId]   — id del div de estado
   */
  function bindForm(config) {
    const form   = document.getElementById(config.formId);
    if (!form) return;

    /* Validación en tiempo real (blur + input) */
    config.fields.forEach(({ inputId, type, required = true }) => {
      const input = document.getElementById(inputId);
      if (!input) return;

      // Al perder el foco → validar
      input.addEventListener('blur', () => {
        validateField(input, type, required);
      });

      // Al escribir después de un error → re-validar en vivo
      input.addEventListener('input', () => {
        if (input.classList.contains('field-error') || input.value.trim()) {
          validateField(input, type, required);
        }
      });

      // Limpiar al enfocar si venía de un reset
      input.addEventListener('focus', () => {
        if (!input.value.trim()) clearFieldState(input);
      });
    });

    /* Intercepción del submit */
    form.addEventListener('submit', function (e) {
      // Validar todos los campos definidos
      let allValid = true;
      config.fields.forEach(({ inputId, type, required = true }) => {
        const input = document.getElementById(inputId);
        if (!input) return;
        const valid = validateField(input, type, required);
        if (!valid) allValid = false;
      });

      if (!allValid) {
        e.preventDefault();
        e.stopImmediatePropagation(); // evita que Formspree intente enviar

        // Shake en el formulario
        form.classList.remove('form-shake');
        void form.offsetWidth; // reflow para reiniciar animación
        form.classList.add('form-shake');
        form.addEventListener('animationend', () => form.classList.remove('form-shake'), { once: true });

        // Scroll al primer error
        const firstError = form.querySelector('.field-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
    }, true); // capture: true → se ejecuta ANTES del listener de Formspree
  }

  /* ══════════════════════════════════════════════════════════
     CONFIGURACIÓN PARA CADA FORMULARIO
  ══════════════════════════════════════════════════════════ */
  function init() {
    injectStyles();

    /* ── Formulario de CONTACTO (contacto.html) ── */
    bindForm({
      formId: 'contactForm',
      fields: [
        { inputId: 'c_nombre',   type: 'nombre',   required: true  },
        { inputId: 'c_email',    type: 'email',    required: true  },
        { inputId: 'c_telefono', type: 'telefono', required: false } // opcional en contacto
      ]
    });

    /* ── Formulario de COTIZACIÓN (paquetes.html) ── */
    bindForm({
      formId: 'quoteForm',
      fields: [
        { inputId: 'nombre',   type: 'nombre',   required: true },
        { inputId: 'empresa', type: 'empresa', required: true },
        { inputId: 'email',    type: 'email',    required: true },
        { inputId: 'telefono', type: 'telefono', required: true }
      ]
    });
  }

  /* Arrancar cuando el DOM esté listo */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();