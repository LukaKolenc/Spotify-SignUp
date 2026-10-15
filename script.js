// V HTML obrazec nima id-ja, zato ga poiščemo po oznaki <form>
const obrazec = document.querySelector("form");

// Izklopimo brskalnikovo preverjanje, da se pokaže SweetAlert
obrazec.noValidate = true;

// Skupne nastavitve, da je okno videti kot ostala stran (temno + zeleno)
const slog = {
  background: "#282828",
  color: "#ffffff",
  confirmButtonColor: "#1ed760",
  customClass: {
    popup: "swal-spotify",
    confirmButton: "swal-spotify-gumb",
  },
};

// Če SweetAlert ni naložen (npr. ni interneta), uporabimo navaden alert
function obvesti(opcije) {
  if (typeof Swal !== "undefined") {
    return Swal.fire({ ...slog, ...opcije });
  }
  window.alert(opcije.title + "\n" + (opcije.text || ""));
  return Promise.resolve();
}

// Poišče polja, ki so prazna. Vrne seznam {ime, element}.
function poisciManjkajoca() {
  const e = obrazec.elements;
  const manjka = [];

  if (!e.email.value.trim()) {
    manjka.push({ ime: "E-poštni naslov", element: e.email });
  }
  if (!e.geslo.value) {
    manjka.push({ ime: "Geslo", element: e.geslo });
  }
  if (!e.ime.value.trim()) {
    manjka.push({ ime: "Ime profila", element: e.ime });
  }

  // Datum rojstva šteje kot eno polje (dan, mesec, leto)
  const prazenDatum = [e.dan, e.mesec, e.leto].find((p) => !p.value);
  if (prazenDatum) {
    manjka.push({ ime: "Datum rojstva", element: prazenDatum });
  }

  if (!obrazec.querySelector('input[name="spol"]:checked')) {
    manjka.push({ ime: "Spol", element: obrazec.querySelector('input[name="spol"]') });
  }

  if (!e.pogoji.checked) {
    manjka.push({ ime: "Strinjanje s pogoji uporabe", element: e.pogoji });
  }

  return manjka;
}

// Preveri še, ali so izpolnjena polja veljavna. Vrne {sporocilo, element} ali null.
function poisciNapako() {
  const e = obrazec.elements;

  if (e.email.validity.typeMismatch) {
    return { sporocilo: "E-poštni naslov ni veljaven.", element: e.email };
  }
  if (e.geslo.value.length < 8) {
    return { sporocilo: "Geslo mora imeti vsaj 8 znakov.", element: e.geslo };
  }
  if (!e.dan.checkValidity()) {
    return { sporocilo: "Dan mora biti med 1 in 31.", element: e.dan };
  }
  if (!e.leto.checkValidity()) {
    return { sporocilo: "Leto rojstva ni veljavno.", element: e.leto };
  }
  return null;
}

obrazec.addEventListener("submit", function (dogodek) {
  dogodek.preventDefault();

  // 1) Manjkajoči podatki
  const manjka = poisciManjkajoca();
  if (manjka.length > 0) {
    obvesti({
      icon: "error",
      title: "Manjkajo podatki",
      text: "Izpolni še: " + manjka.map((m) => m.ime).join(", ") + ".",
      confirmButtonText: "V redu",
    }).then(() => manjka[0].element.focus());
    return;
  }

  // 2) Vsa polja so izpolnjena, a morda neveljavna
  const napaka = poisciNapako();
  if (napaka) {
    obvesti({
      icon: "warning",
      title: "Preveri podatke",
      text: napaka.sporocilo,
      confirmButtonText: "V redu",
    }).then(() => napaka.element.focus());
    return;
  }

  // 3) Vse je v redu
  obvesti({
    icon: "success",
    title: "Registracija uspešna!",
    text: "Dobrodošel/a, " + obrazec.elements.ime.value.trim() + "!",
    confirmButtonText: "Začni poslušati",
  }).then(() => obrazec.reset());
});
