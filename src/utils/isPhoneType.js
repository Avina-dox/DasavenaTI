// Devuelve true si el nombre del tipo contiene "tel" o "phone"
export function isPhoneType(selectedTypeId, typesList) {
  if (!selectedTypeId || !Array.isArray(typesList)) return false;
  const t = typesList.find(x => String(x.id) === String(selectedTypeId));
  const name = (t?.name || "").toLowerCase();
  return name.includes("tel") || name.includes("phone");
}
