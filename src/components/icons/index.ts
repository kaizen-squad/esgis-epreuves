/**
 * Jeu d'icones du site (R-02) : les icones Feather deja utilisees (`react-icons/fi`), point
 * d'entree unique pour ne pas piocher au hasard dans d'autres sets. Une icone maison dessinee
 * sur la meme grille (24x24, trait 2px) peut s'ajouter ici au fil des ecrans qui en ont besoin.
 * Toujours choisir l'icone pour ce qu'elle represente, jamais une icone generique sans rapport
 * avec son contexte (ex. le meme pictogramme satellite recycle sur deux cartes distinctes).
 */
export {
  FiArrowLeft,
  FiArrowRight,
  FiBookmark,
  FiCalendar,
  FiCompass,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFileText,
  FiLayers,
  FiLinkedin,
  FiMoreVertical,
  FiRefreshCw,
  FiStar,
  FiX,
} from "react-icons/fi";
export { GoDotFill } from "react-icons/go";
// Feather n'a pas d'icone WhatsApp ; meme exception de marque que FiLinkedin, mais prise dans
// react-icons/fa faute d'equivalent Feather.
export { FaWhatsapp } from "react-icons/fa";
