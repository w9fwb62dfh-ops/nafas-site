/* =========================================================
   NAFAS — script du site
   ========================================================= */

const WHATSAPP_NUMBER = "213540143511";
const WHATSAPP_NUMBER_PARTENAIRE = "213558673207";

/* Tarifs de livraison par wilaya (en DA) — tarifs réels NAFAS.
   Format : [code, nom, tarif à domicile, tarif stop desk (bureau)]
   null = option non disponible pour cette wilaya. */
const WILAYAS = [
  ["01","Adrar",1400,970],["02","Chlef",850,520],["03","Laghouat",950,620],["04","Oum El Bouaghi",850,520],
  ["05","Batna",900,520],["06","Béjaïa",800,520],["07","Biskra",950,620],["08","Béchar",1100,720],
  ["09","Blida",600,470],["10","Bouira",700,520],["11","Tamanrasset",1600,1120],["12","Tébessa",900,570],
  ["13","Tlemcen",900,570],["14","Tiaret",850,520],["15","Tizi Ouzou",750,520],["16","Alger",500,370],
  ["17","Djelfa",950,570],["18","Jijel",900,520],["19","Sétif",800,520],["20","Saïda",900,570],
  ["21","Skikda",900,520],["22","Sidi Bel Abbès",900,520],["23","Annaba",850,520],["24","Guelma",900,520],
  ["25","Constantine",800,520],["26","Médéa",800,520],["27","Mostaganem",900,520],["28","M'Sila",850,570],
  ["29","Mascara",900,520],["30","Ouargla",950,670],["31","Oran",800,520],["32","El Bayadh",1100,670],
  ["33","Illizi",null,null],["34","Bordj Bou Arreridj",800,520],["35","Boumerdès",700,520],["36","El Tarf",850,520],
  ["37","Tindouf",null,null],["38","Tissemsilt",900,null],["39","El Oued",950,670],["40","Khenchela",900,null],
  ["41","Souk Ahras",900,520],["42","Tipaza",700,520],["43","Mila",900,520],["44","Aïn Defla",900,520],
  ["45","Naâma",1100,670],["46","Aïn Témouchent",900,520],["47","Ghardaïa",950,620],["48","Relizane",900,520],
  ["49","Timimoun",1400,null],["50","Bordj Badji Mokhtar",null,null],["51","Ouled Djellal",950,620],
  ["52","Béni Abbès",1100,970],["53","In Salah",1600,null],["54","In Guezzam",1600,null],["55","Touggourt",950,670],
  ["56","Djanet",null,null],["57","El M'Ghair",950,null],["58","El Meniaa",1000,null]
];

/* ---------- Remplir le select des wilayas ---------- */
const wilayaSelect = document.getElementById("wilayaSelect");
WILAYAS.forEach(([code, name]) => {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = `${code} — ${name}`;
  wilayaSelect.appendChild(opt);
});

const livraisonSelect = document.getElementById("livraisonSelect");
const feeDisplay = document.getElementById("feeDisplay");

function getSelectedWilaya(){
  return WILAYAS.find(w => w[0] === wilayaSelect.value);
}

function updateLivraisonOptions(){
  const w = getSelectedWilaya();
  if (!w) return;
  const [, , domicile, bureau] = w;
  livraisonSelect.innerHTML = "";
  if (domicile !== null){
    const o = document.createElement("option");
    o.value = "domicile"; o.dataset.fee = domicile;
    o.textContent = `Livraison à domicile — ${domicile.toLocaleString("fr-FR")} DA`;
    livraisonSelect.appendChild(o);
  }
  if (bureau !== null){
    const o = document.createElement("option");
    o.value = "bureau"; o.dataset.fee = bureau;
    o.textContent = `Retrait au bureau (Stop Desk) — ${bureau.toLocaleString("fr-FR")} DA`;
    livraisonSelect.appendChild(o);
  }
  if (domicile === null && bureau === null){
    const o = document.createElement("option");
    o.value = ""; o.dataset.fee = "";
    o.textContent = "Non desservie actuellement";
    livraisonSelect.appendChild(o);
  }
  updateFee();
}

function updateFee(){
  const selected = livraisonSelect.options[livraisonSelect.selectedIndex];
  const fee = selected ? selected.dataset.fee : "";
  feeDisplay.textContent = fee ? `${Number(fee).toLocaleString("fr-FR")} DA` : "—";
}

wilayaSelect.addEventListener("change", updateLivraisonOptions);
livraisonSelect.addEventListener("change", updateFee);

/* ---------- Ouverture / fermeture de la modale ---------- */
const modal = document.getElementById("orderModal");
const modalProductName = document.getElementById("modalProductName");
const couleurInput = document.getElementById("couleurInput");
const orderForm = document.getElementById("orderForm");

let currentProduct = { name: "", price: 0, colors: "" };

document.querySelectorAll(".btn-order").forEach(btn => {
  btn.addEventListener("click", () => {
    currentProduct = {
      name: btn.dataset.product,
      price: Number(btn.dataset.price),
      colors: btn.dataset.colors || ""
    };
    modalProductName.textContent = currentProduct.name;
    couleurInput.value = currentProduct.colors;
    wilayaSelect.selectedIndex = 0;
    updateLivraisonOptions();
    orderForm.style.display = "block";
    document.getElementById("confirmStep").style.display = "none";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
});

function closeModal(){
  modal.classList.remove("open");
  document.body.style.overflow = "";
  orderForm.reset();
  orderForm.style.display = "block";
  document.getElementById("confirmStep").style.display = "none";
}
document.getElementById("closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });

/* ---------- Soumission -> WhatsApp ---------- */
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(orderForm);
  const nom = data.get("nom");
  const telephone = data.get("telephone");
  const wilayaLabel = wilayaSelect.options[wilayaSelect.selectedIndex]?.textContent || "";
  const livraisonSelected = livraisonSelect.options[livraisonSelect.selectedIndex];
  const modeLivraison = livraisonSelected ? livraisonSelected.textContent : "";
  const fraisLivraison = Number(livraisonSelected?.dataset.fee || 0);
  const adresse = data.get("adresse");
  const couleur = data.get("couleur");
  const quantite = data.get("quantite");
  const remarque = data.get("remarque");

  const totalProduit = currentProduct.price * Number(quantite);
  const totalGeneral = totalProduit + fraisLivraison;

  const message =
`Nouvelle commande NAFAS

Produit : ${currentProduct.name}
Couleur : ${couleur}
Quantité : ${quantite}
Prix unitaire : ${currentProduct.price.toLocaleString("fr-FR")} DA
Sous-total : ${totalProduit.toLocaleString("fr-FR")} DA

Nom : ${nom}
Téléphone : ${telephone}
Wilaya : ${wilayaLabel}
Mode de livraison : ${modeLivraison}
Adresse : ${adresse}
Frais de livraison estimés : ${fraisLivraison.toLocaleString("fr-FR")} DA
Total estimé : ${totalGeneral.toLocaleString("fr-FR")} DA
${remarque ? "Remarque : " + remarque : ""}`;

  const url1 = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const url2 = `https://wa.me/${WHATSAPP_NUMBER_PARTENAIRE}?text=${encodeURIComponent(message)}`;

  orderForm.style.display = "none";
  const confirmBox = document.getElementById("confirmStep");
  confirmBox.innerHTML = `
    <p class="confirm-title">Commande prête à envoyer ✷</p>
    <p class="confirm-text">Envoie ta commande sur WhatsApp — appuie sur les 2 boutons ci-dessous l'un après l'autre pour que la commande arrive bien aux deux responsables NAFAS.</p>
    <a href="${url1}" target="_blank" class="btn btn-primary btn-block whatsapp-link">1. Envoyer à NAFAS</a>
    <a href="${url2}" target="_blank" class="btn btn-outline btn-block whatsapp-link">2. Envoyer à la partenaire</a>
  `;
  confirmBox.style.display = "block";
});
