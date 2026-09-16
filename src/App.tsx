import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Instagram,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { posthog } from './lib/analytics';

type Variant = {
  id: string;
  name: string;
  notes: string;
  image: string;
  images?: string[];
  names?: string[];
};

export type ProductCategory = 'Perfume' | 'Combo' | "Victoria's Secret";

export type Gender = 'Mujer' | 'Hombre' | 'Unisex';

const ARGENTINE_PROVINCES = ['Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'];

export type Perfume = {
  id: string;
  name: string;
  subtitle: string;
  family: string;
  notes: string;
  price: number;
  volume: string;
  accent: string;
  image: string;
  description: string;
  variants?: Variant[] | null;
  category?: ProductCategory;
  brand?: string;
  gender?: Gender | null;
  in_stock?: boolean;
};

const getCategory = (perfume: Perfume): ProductCategory => perfume.category ?? 'Perfume';

type CartItem = { product: Perfume; variant: Variant; quantity: number };

// Productos sin variantes propias se tratan como una única variante que
// espeja los campos base — así el resto del código no necesita ramas para
// "con variantes" vs "sin variantes".
const getVariants = (perfume: Perfume): Variant[] =>
  perfume.variants && perfume.variants.length > 0
    ? perfume.variants
    : [{ id: perfume.id, name: perfume.name, notes: perfume.notes, image: perfume.image }];

const variantLabel = (product: Perfume, variant: Variant) => variant.name === product.name ? product.name : `${product.name} — ${variant.name}`;

const fallbackPerfumes: Perfume[] = [
  { id: 'yara-exclusive', name: 'Yara Exclusive', subtitle: 'Intenso · envolvente', family: 'Oriental dulce', notes: 'Ámbar · vainilla · sándalo', price: 45000, volume: '100 ml', accent: '#9b5b2a', image: '/images/perfumes/yara-exclusive.webp', description: 'Una estela cálida y sofisticada, con la profundidad del ámbar y un final suave de vainilla.', category: 'Perfume', brand: 'Lattafa' },
  { id: 'yara-elixir', name: 'Yara Elixir', subtitle: 'Floral · radiante', family: 'Floral oriental', notes: 'Rosa · miel · almizcle', price: 48000, volume: '100 ml', accent: '#a84b5a', image: '/images/perfumes/yara-elixir.webp', description: 'Dulce, femenino y luminoso. Una versión de Yara con más cuerpo y una presencia aterciopelada.', category: 'Perfume', brand: 'Lattafa' },
  { id: 'qimmah-women', name: 'Qimmah For Women', subtitle: 'Dulce · elegante', family: 'Amaderado dulce', notes: 'Frutos rojos · jazmín · vainilla', price: 52000, volume: '100 ml', accent: '#466b5b', image: '/images/perfumes/qimmah-women.webp', description: 'Una composición intensa que mezcla flores blancas, frutos jugosos y un fondo cremoso.', category: 'Perfume', brand: 'Lattafa' },
  { id: 'art-of-universe', name: 'Art of Universe', subtitle: 'Magnético · especiado', family: 'Amaderado especiado', notes: 'Azafrán · cuero · maderas', price: 58000, volume: '100 ml', accent: '#304679', image: '/images/perfumes/art-of-universe.webp', description: 'Un perfume de carácter, inspirado en la inmensidad del universo y el brillo de los metales.', category: 'Perfume', brand: 'Lattafa Pride' },
  { id: 'odyssey-limited', name: 'Odyssey Limited', subtitle: 'Fresco · aventurero', family: 'Aromático fresco', notes: 'Cítricos · lavanda · maderas', price: 42000, volume: '100 ml', accent: '#5d91aa', image: '/images/perfumes/odyssey-limited.webp', description: 'Frescura limpia y energía cítrica para acompañar todos los días con estilo.', category: 'Perfume', brand: 'Armaf' },
  { id: 'now-women', name: 'Now Women', subtitle: 'Frutal · contemporáneo', family: 'Floral frutal', notes: 'Pera · peonía · vainilla', price: 38000, volume: '100 ml', accent: '#b78686', image: '/images/perfumes/now-women.webp', description: 'Un aroma amable y moderno, con flores delicadas y una dulzura que queda cerca de la piel.', category: 'Perfume', brand: 'RAVE' },
];

const formatPrice = (price: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const storyImages = [
  '/images/perfumes/lattafa-khamrah.webp',
  '/images/perfumes/yara-elixir.webp',
  '/images/perfumes/qimmah-women.webp',
  '/images/perfumes/now-women.webp',
];

const storySlides = [
  { image: storyImages[0], bg: '#1a1208', accent: '#c99558', eyebrow: 'Nuestra mirada', titleTop: 'Perfumes para', titleBottom: 'ser recordada.', phrase: 'Una estela cálida que llega antes que vos. El ámbar y la vainilla dejan una huella que no se olvida.', note: 'Canela · dátiles · vainilla', name: 'Khamrah', imageSide: 'right' as const, gradient: 'linear-gradient(to right, #1a1208 0%, rgba(26,18,8,0.88) 38%, rgba(26,18,8,0) 65%)' },
  { image: storyImages[1], bg: '#0a0e1a', accent: '#7b9ad6', eyebrow: 'Otra mirada', titleTop: 'El universo', titleBottom: 'en un frasco.', phrase: 'Especiado, magnético y profundo. Un aroma que ocupa la escena y no pide permiso.', note: 'Azafrán · cuero · maderas', name: 'Art of Universe', imageSide: 'left' as const, gradient: 'linear-gradient(to left, #0a0e1a 0%, rgba(10,14,26,0.88) 38%, rgba(10,14,26,0) 65%)' },
  { image: storyImages[2], bg: '#0a1614', accent: '#5d91aa', eyebrow: 'Otra mirada', titleTop: 'Cada día', titleBottom: 'una odisea.', phrase: 'Frescura limpia y energía cítrica. Tu presencia también tiene perfume, y este es ligero.', note: 'Cítricos · lavanda · maderas', name: 'Odyssey Limited', imageSide: 'right' as const, gradient: 'linear-gradient(to right, #0a1614 0%, rgba(10,22,20,0.88) 38%, rgba(10,22,20,0) 65%)' },
  { image: storyImages[3], bg: '#1a1012', accent: '#b78686', eyebrow: 'Otra mirada', titleTop: 'Lo que queda', titleBottom: 'cuando te vas.', phrase: 'Una dulzura suave que queda cerca de la piel. Flores delicadas con un fondo empolvado.', note: 'Pera · peonía · vainilla', name: 'Now Women', imageSide: 'left' as const, gradient: 'linear-gradient(to left, #1a1012 0%, rgba(26,16,18,0.88) 38%, rgba(26,16,18,0) 65%)' },
];

const familyMeta = [
  { name: 'Florales', line: 'Delicados, luminosos y llenos de vida.', tone: '#23171b' },
  { name: 'Amaderados', line: 'Profundos, cálidos y con carácter.', tone: '#171d19' },
  { name: 'Orientales', line: 'Intensos, dulces y memorables.', tone: '#211719' },
  { name: 'Frescos', line: 'Limpios, vibrantes y versátiles.', tone: '#151c22' },
];

const getMacroFamily = (family: string): string => {
  const value = family.toLowerCase();
  if (value.includes('floral')) return 'Florales';
  if (value.includes('amaderado')) return 'Amaderados';
  if (value.includes('oriental') || value.includes('gourmand')) return 'Orientales';
  return 'Frescos';
};

const categoryMeta: { value: ProductCategory; label: string }[] = [
  { value: 'Perfume', label: 'Perfumes' },
  { value: 'Combo', label: 'Combos' },
  { value: "Victoria's Secret", label: "Victoria's Secret" },
];

const genderMeta: Gender[] = ['Mujer', 'Hombre', 'Unisex'];

// Combo "armá el tuyo": 2 perfumes + 1 body splash a elección, precio fijo.
// Productos reales ya cargados en Supabase — confirmado con Facu 2026-09-12.
// Precio en $145.000 (no $160.000): a $160.000, 10 de las 21 combinaciones posibles de
// perfumes no dejaban ahorro real (5 empataban, 5 salían más caras que comprar suelto).
// A $145.000 las 21 combinaciones ahorran siempre — confirmado con Gisela 2026-09-12.
const COMBO_PERFUME_IDS = ['lattafa-angham', 'lattafa-yara-moi', 'lattafa-badee-al-oud-sublime', 'lattafa-mayar', 'lattafa-hayaati-florence', 'lattafa-yara-rosa', 'now-women'];
const COMBO_BODY_IDS = ['victorias-secret-bare-vanilla', 'victorias-secret-coconut-passion', 'victorias-secret-love-spell-shimmer', 'victorias-secret-pure-seduction'];
const COMBO_PRICE = 145000;

const LETTER_STAGGER = 0.028;

// Anima el texto letra por letra al montar; baseDelay retrasa el arranque de la segunda
// linea (con leve solape entre ambas, no secuencia estricta). aria-hidden porque el
// texto real y accesible va en el aria-label del <h1> que envuelve a este componente.
const AnimatedLetters = ({ text, baseDelay = 0 }: { text: string; baseDelay?: number }) => (
  <span aria-hidden="true">
    {text.split('').map((char, index) => (
      <span key={index} className="animate-letter-drop inline-block" style={{ animationDelay: `${baseDelay + index * LETTER_STAGGER}s` }}>
        {char === ' ' ? ' ' : char}
      </span>
    ))}
  </span>
);

function App() {
  const [perfumes, setPerfumes] = useState<Perfume[]>(fallbackPerfumes);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('Perfume');
  const [activeFamily, setActiveFamily] = useState('Todos');
  const [activeGender, setActiveGender] = useState<Gender | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Perfume | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [storyImageIndex, setStoryImageIndex] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<Record<string, string>>({});
  const [comboPerfumeIds, setComboPerfumeIds] = useState<string[]>([]);
  const [comboBodyId, setComboBodyId] = useState('');
  const [comboPickContext, setComboPickContext] = useState<'perfume' | 'body' | null>(null);
  const [isCheckoutFormOpen, setIsCheckoutFormOpen] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<{ name: string; deliveryMethod: 'mano' | 'correo' | null; zone: string; street: string; floor: string; city: string; province: string; postalCode: string; email: string }>({ name: '', deliveryMethod: null, zone: '', street: '', floor: '', city: '', province: '', postalCode: '', email: '' });
  const dragStartY = useRef<number | null>(null);
  const dragYRef = useRef(0);
  const prevCatalogFilterKey = useRef(`${catalogPage}|${activeGender}|${activeFamily}|${activeCategory}`);
  const prevActiveCategory = useRef(activeCategory);
  const toastTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const catalogGridRef = useRef<HTMLDivElement>(null);
  const searchTrackTimeoutRef = useRef<number | null>(null);
  const focusSearch = () => {
    setIsMenuOpen(false);
    document.getElementById('coleccion')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => searchInputRef.current?.focus(), 400);
  };
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.from('perfumes').select('*').order('created_at').then(({ data }) => {
      if (mounted && data && data.length > 0) setPerfumes(data as Perfume[]);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isCartOpen) return;
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    setToast(null);
  }, [isCartOpen]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStoryImageIndex((current) => (current + 1) % storyImages.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!selectedProduct && !isCartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selectedProduct, isCartOpen]);

  const perfumeOnly = useMemo(() => perfumes.filter((perfume) => getCategory(perfume) === 'Perfume'), [perfumes]);
  const comboPerfumeOptions = useMemo(() => perfumes.filter((perfume) => COMBO_PERFUME_IDS.includes(perfume.id)), [perfumes]);
  const comboBodyOptions = useMemo(() => perfumes.filter((perfume) => COMBO_BODY_IDS.includes(perfume.id)), [perfumes]);
  const families = useMemo(() => ['Todos', ...Array.from(new Set(perfumeOnly.map((perfume) => perfume.family)))], [perfumeOnly]);
  const marqueeBrands = useMemo(() => Array.from(new Set(perfumes.map((perfume) => perfume.brand).filter((brand): brand is string => Boolean(brand)))).sort(), [perfumes]);
  const macroFamilyNames = useMemo(() => familyMeta.map((meta) => meta.name), []);
  const familySlides = useMemo(() => familyMeta.map((meta) => {
    const members = perfumeOnly.filter((perfume) => getMacroFamily(perfume.family) === meta.name);
    return { ...meta, count: members.length, images: members.map((member) => member.image) };
  }), [perfumeOnly]);
  const [familyImageIndex, setFamilyImageIndex] = useState<number[]>(() => familyMeta.map(() => 0));
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = window.setInterval(() => {
      setFamilyImageIndex((current) => current.map((index, slideIndex) => {
        const count = familySlides[slideIndex]?.images.length ?? 0;
        if (count <= 1) return index;
        let next = Math.floor(Math.random() * count);
        while (next === index) next = Math.floor(Math.random() * count);
        return next;
      }));
    }, 3200);
    return () => window.clearInterval(interval);
  }, [familySlides]);
  const priceBounds = useMemo<[number, number]>(() => {
    if (perfumes.length === 0) return [0, 0];
    const prices = perfumes.map((perfume) => perfume.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [perfumes]);
  const effectivePriceRange = priceRange ?? priceBounds;
  const isSearching = searchQuery.trim().length > 0;
  const visiblePerfumes = perfumes
    .filter((perfume) => isSearching || getCategory(perfume) === activeCategory)
    .filter((perfume) => isSearching || activeCategory !== 'Perfume' || activeFamily === 'Todos' || (macroFamilyNames.includes(activeFamily) ? getMacroFamily(perfume.family) === activeFamily : perfume.family === activeFamily))
    .filter((perfume) => perfume.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    .filter((perfume) => perfume.price >= effectivePriceRange[0] && perfume.price <= effectivePriceRange[1])
    .filter((perfume) => !activeGender || perfume.gender === activeGender)
    .sort((a, b) => Number(a.in_stock === false) - Number(b.in_stock === false));
  const CATALOG_PAGE_SIZE = 12;
  const catalogTotalPages = Math.max(1, Math.ceil(visiblePerfumes.length / CATALOG_PAGE_SIZE));
  const paginatedPerfumes = visiblePerfumes.slice((catalogPage - 1) * CATALOG_PAGE_SIZE, catalogPage * CATALOG_PAGE_SIZE);

  useEffect(() => {
    if (searchTrackTimeoutRef.current) window.clearTimeout(searchTrackTimeoutRef.current);
    const query = searchQuery.trim();
    if (!query) return;
    searchTrackTimeoutRef.current = window.setTimeout(() => {
      posthog.capture('search_performed', { query, results_count: visiblePerfumes.length });
    }, 600);
    return () => { if (searchTrackTimeoutRef.current) window.clearTimeout(searchTrackTimeoutRef.current); };
  }, [searchQuery, visiblePerfumes.length]);

  const setActiveFamilyAndResetPage = (family: string) => { setActiveFamily(family); setCatalogPage(1); };
  const toggleGender = (gender: Gender) => { setActiveGender((current) => (current === gender ? null : gender)); setCatalogPage(1); };
  const goToCategory = (category: ProductCategory) => {
    setActiveCategory(category);
    setActiveFamily('Todos');
    setCatalogPage(1);
    setIsCollectionMenuOpen(false);
    setIsMenuOpen(false);
    document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' });
  };
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const selectedModalVariants = selectedProduct ? getVariants(selectedProduct) : [];
  const selectedModalVariant = selectedProduct ? (selectedModalVariants.find((variant) => variant.id === selectedVariantId[selectedProduct.id]) ?? selectedModalVariants[0]) : null;
  const comboPickedInModal = selectedProduct && comboPickContext ? (comboPickContext === 'perfume' ? comboPerfumeIds.includes(selectedProduct.id) : comboBodyId === selectedProduct.id) : false;
  const comboPickFullInModal = comboPickContext === 'perfume' && !comboPickedInModal && comboPerfumeIds.length >= 2;
  const selectedOutOfStock = selectedProduct?.in_stock === false;

  const getSelectedVariant = (perfume: Perfume): Variant => {
    const variants = getVariants(perfume);
    return variants.find((variant) => variant.id === selectedVariantId[perfume.id]) ?? variants[0];
  };

  const addToCart = (product: Perfume, variant: Variant, source: 'grid_quick_add' | 'modal') => {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id && item.variant.id === variant.id);
      return existing
        ? items.map((item) => item.product.id === product.id && item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { product, variant, quantity: 1 }];
    });
    posthog.capture('product_added_to_cart', {
      product_id: product.id,
      product_name: product.name,
      variant_name: variant.name,
      price: product.price,
      quantity: 1,
      source,
    });
  };

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 2600);
  };

  const quickAdd = (event: ReactMouseEvent, product: Perfume) => {
    event.stopPropagation();
    const variant = getSelectedVariant(product);
    addToCart(product, variant, 'grid_quick_add');
    showToast(`${variantLabel(product, variant)} agregado al carrito`);
  };

  const changeQuantity = (productId: string, variantId: string, amount: number) => {
    setCart((items) => items.flatMap((item) => item.product.id === productId && item.variant.id === variantId ? (item.quantity + amount > 0 ? [{ ...item, quantity: item.quantity + amount }] : []) : [item]));
  };

  const canSubmitCheckout = checkoutInfo.name.trim().length > 0 && (
    checkoutInfo.deliveryMethod === 'mano' ? checkoutInfo.zone.trim().length > 0
    : checkoutInfo.deliveryMethod === 'correo' ? checkoutInfo.street.trim().length > 0 && checkoutInfo.city.trim().length > 0 && checkoutInfo.province.trim().length > 0 && checkoutInfo.postalCode.trim().length > 0
    : false
  );

  const whatsappCartLink = (() => {
    const lines = cart.map((item) => `• ${variantLabel(item.product, item.variant)} ${item.product.volume} x${item.quantity} — ${formatPrice(item.product.price * item.quantity)}`);
    const contactLines = [
      `Nombre y apellido: ${checkoutInfo.name.trim()}`,
      ...(checkoutInfo.deliveryMethod === 'mano' ? [
        'Entrega: en mano (Zona Norte / CABA)',
        `Zona / barrio: ${checkoutInfo.zone.trim()}`,
      ] : checkoutInfo.deliveryMethod === 'correo' ? [
        'Entrega: envío por correo (costo del envío aparte, a coordinar)',
        `Calle y número: ${checkoutInfo.street.trim()}`,
        ...(checkoutInfo.floor.trim() ? [`Piso / depto: ${checkoutInfo.floor.trim()}`] : []),
        `Localidad: ${checkoutInfo.city.trim()}`,
        `Provincia: ${checkoutInfo.province.trim()}`,
        `Código postal: ${checkoutInfo.postalCode.trim()}`,
      ] : []),
      ...(checkoutInfo.email.trim() ? [`Email: ${checkoutInfo.email.trim()}`] : []),
    ];
    const message = `Hola A&G Perfumes! Quiero hacer este pedido:\n\n${lines.join('\n')}\n\nTotal: ${formatPrice(cartTotal)}\n\n${contactLines.join('\n')}`;
    return `https://wa.me/5491124578934?text=${encodeURIComponent(message)}`;
  })();

  const trackWhatsappCheckout = () => {
    posthog.capture('whatsapp_checkout_click', {
      cart_total: cartTotal,
      cart_items: cart.map((item) => `${variantLabel(item.product, item.variant)} x${item.quantity}`),
    });
  };

  const openProduct = (product: Perfume, comboKind: 'perfume' | 'body' | null = null) => {
    setIsClosing(false);
    setIsDragging(false);
    setDragY(0);
    dragYRef.current = 0;
    setSelectedProduct(product);
    setComboPickContext(comboKind);
    posthog.capture('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      category: getCategory(product),
      price: product.price,
    });
  };

  const closeProduct = () => {
    setIsClosing(true);
    setDragY(0);
    dragYRef.current = 0;
    window.setTimeout(() => { setSelectedProduct(null); setIsClosing(false); }, 340);
  };

  const handleDragStart = (event: ReactTouchEvent) => {
    dragStartY.current = event.touches[0].clientY;
    setIsDragging(true);
  };

  const handleDragMove = (event: ReactTouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = event.touches[0].clientY - dragStartY.current;
    if (delta > 0) {
      dragYRef.current = delta;
      setDragY(delta);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartY.current = null;
    const finalDragY = dragYRef.current;
    dragYRef.current = 0;
    if (finalDragY > 110) {
      closeProduct();
    } else {
      setDragY(0);
    }
  };

  const openCart = (source: 'header_icon' | 'after_add_from_modal') => {
    setIsCartOpen(true);
    posthog.capture('cart_opened', { source, cart_items_count: cartCount, cart_total: cartTotal });
  };

  const addFromModal = (product: Perfume, variant: Variant) => {
    addToCart(product, variant, 'modal');
    closeProduct();
    openCart('after_add_from_modal');
  };

  const toggleComboPerfume = (id: string) => {
    setComboPerfumeIds((current) => {
      if (current.includes(id)) return current.filter((existing) => existing !== id);
      if (current.length >= 2) return current;
      return [...current, id];
    });
  };

  const pickForCombo = (product: Perfume, kind: 'perfume' | 'body') => {
    if (kind === 'perfume') toggleComboPerfume(product.id);
    else setComboBodyId((current) => (current === product.id ? '' : product.id));
    closeProduct();
  };

  const addComboToCart = () => {
    const perfume1 = perfumes.find((perfume) => perfume.id === comboPerfumeIds[0]);
    const perfume2 = perfumes.find((perfume) => perfume.id === comboPerfumeIds[1]);
    const body = perfumes.find((perfume) => perfume.id === comboBodyId);
    if (!perfume1 || !perfume2 || !body) return;
    const comboProduct: Perfume = {
      id: 'combo-2-perfumes-1-body',
      name: 'Combo 2 Perfumes + 1 Body Splash',
      subtitle: 'Armado a elección',
      family: 'Combo',
      notes: '',
      price: COMBO_PRICE,
      volume: '2 x 100 ml + 1 x 250 ml',
      accent: perfume1.accent,
      image: perfume1.image,
      description: 'Elegís 2 perfumes y 1 body splash Victoria\'s Secret, y te llevás los 3 a este precio fijo.',
      category: 'Combo',
    };
    const variant: Variant = {
      id: `${perfume1.id}_${perfume2.id}_${body.id}`,
      name: `${perfume1.name} + ${perfume2.name} + ${body.name}`,
      notes: `${perfume1.notes} · ${perfume2.notes} · ${body.notes}`,
      image: perfume1.image,
      images: [perfume1.image, perfume2.image, body.image],
      names: [perfume1.name, perfume2.name, body.name],
    };
    addToCart(comboProduct, variant, 'modal');
    setComboPerfumeIds([]);
    setComboBodyId('');
    openCart('after_add_from_modal');
  };

  // Dispara scroll hacia el catálogo cuando cambia la página O un filtro
  // de click (género/familia) — antes solo miraba la página, así que
  // aplicar un filtro estando ya en la página 1 no movía la pantalla y
  // parecía que el filtro no había hecho nada (dead click en PostHog: 8
  // de 37 en la semana del 12/9 eran justo estos filtros).
  // Categoría queda afuera: cambiarla ya tiene su propio scroll (al inicio
  // de la sección), y en "Combos" ese inicio es el combo armable, no la
  // grilla — si este efecto también scrolleaba, tapaba ese primer combo
  // saltando directo a la grilla de abajo.
  // Búsqueda y precio quedan afuera a propósito: son inputs continuos
  // (tipear, arrastrar) donde mover la pantalla en cada cambio molestaría.
  useEffect(() => {
    const categoryChanged = prevActiveCategory.current !== activeCategory;
    prevActiveCategory.current = activeCategory;
    const key = `${catalogPage}|${activeGender}|${activeFamily}|${activeCategory}`;
    if (!categoryChanged && prevCatalogFilterKey.current !== key) {
      catalogGridRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
    prevCatalogFilterKey.current = key;
  }, [catalogPage, activeGender, activeFamily, activeCategory]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (selectedProduct) { closeProduct(); return; }
      if (isCartOpen) { setIsCartOpen(false); return; }
      if (isCollectionMenuOpen) { setIsCollectionMenuOpen(false); return; }
      if (isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, isCartOpen, isCollectionMenuOpen, isMenuOpen]);

  return (
    <div className="min-h-screen bg-[#0b0b0a] text-[#f2eee7] selection:bg-[#c99558] selection:text-black">
      <header className="fixed inset-x-0 top-0 z-40 px-5 py-5 md:px-10">
        <nav className={`mx-auto flex max-w-[1440px] items-center justify-between rounded-full border px-5 py-3 backdrop-blur-md transition-colors duration-300 ${isScrolled ? 'border-white/10 bg-[#0b0b0a]/90' : 'border-white/15 bg-black/25'}`}>
          <a href="#inicio" className="font-serif text-xl tracking-[-0.04em]">A&G <span className="text-[#c99558]">Perfumes</span></a>
          <div className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.22em] text-white/65 lg:flex">
            <a href="#inicio" className="transition hover:text-white">Inicio</a>
            <div className="relative">
              <button onClick={() => setIsCollectionMenuOpen((open) => !open)} aria-haspopup="true" aria-expanded={isCollectionMenuOpen} className="flex items-center gap-1.5 uppercase tracking-[0.22em] transition hover:text-white">Colección <ChevronDown size={12} className={`transition-transform ${isCollectionMenuOpen ? 'rotate-180' : ''}`} /></button>
              {isCollectionMenuOpen && <div className="animate-dropdown-in absolute left-1/2 top-full z-50 mt-4 w-52 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-[#151412]/95 p-1.5 normal-case tracking-normal shadow-2xl backdrop-blur-md">{categoryMeta.map((meta) => <button key={meta.value} onClick={() => goToCategory(meta.value)} className={`block w-full rounded-xl px-4 py-2.5 text-left text-xs transition hover:bg-white/10 ${activeCategory === meta.value ? 'text-[#c99558]' : 'text-white/80'}`}>{meta.label}</button>)}</div>}
            </div>
            <a href="#historia" className="transition hover:text-white">Nosotros</a><a href="#contacto" className="transition hover:text-white">Contacto</a>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Buscar producto" onClick={focusSearch} className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10"><Search size={17} /></button>
            <button aria-label="Abrir carrito" onClick={() => openCart('header_icon')} className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10"><ShoppingBag size={17} />{cartCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c99558] px-1 text-[9px] font-bold text-black">{cartCount}</span>}</button>
            <a href="#coleccion" className="hidden whitespace-nowrap rounded-full bg-[#f2eee7] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#c99558] lg:block">Ver colección</a>
            <button aria-label="Abrir menú" onClick={() => setIsMenuOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full lg:hidden"><Menu size={20} /></button>
          </div>
        </nav>
      </header>

      {isCollectionMenuOpen && <button aria-label="Cerrar menú de colección" onClick={() => setIsCollectionMenuOpen(false)} className="fixed inset-0 z-30" />}

      {isMenuOpen && <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#11110f] p-6"><div className="flex items-center justify-between"><span className="font-serif text-xl">A&G <span className="text-[#c99558]">Perfumes</span></span><button onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menú" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/5"><X /></button></div><div className="flex flex-col gap-6 font-serif text-5xl"><a onClick={() => setIsMenuOpen(false)} href="#inicio">Inicio</a>{categoryMeta.map((meta) => <button key={meta.value} onClick={() => goToCategory(meta.value)} className="text-left font-serif text-5xl">{meta.label}</button>)}<a onClick={() => setIsMenuOpen(false)} href="#historia">Nosotros</a><a onClick={() => setIsMenuOpen(false)} href="#contacto">Contacto</a></div><p className="text-xs uppercase tracking-[0.2em] text-white/45">Perfumería árabe · Argentina</p></div>}

      <main>
        <section id="inicio" className="relative flex min-h-[640px] items-end overflow-hidden bg-[#080909] px-6 pb-8 pt-28 md:min-h-screen md:px-12 md:pb-20 md:pt-32">
          <video className="absolute inset-0 hidden h-full w-full object-cover object-[70%_center] md:block" autoPlay={!prefersReducedMotion} muted loop={!prefersReducedMotion} playsInline preload="auto" aria-hidden="true"><source src="https://res.cloudinary.com/u5z5trw7/video/upload/v1787722785/Underwater_perfume_advertisement__202608260154.mp4" type="video/mp4" /></video>
          <video className="absolute inset-0 h-full w-full object-cover object-center md:hidden" autoPlay={!prefersReducedMotion} muted loop={!prefersReducedMotion} playsInline preload="auto" aria-hidden="true"><source src="https://res.cloudinary.com/u5z5trw7/video/upload/v1787722784/Underwater_perfume_advertisement_202608260154_202608260224.mp4" type="video/mp4" /></video>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0b0a08 0%, rgba(11,10,8,0.92) 25%, rgba(11,10,8,0.55) 45%, rgba(11,10,8,0) 65%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#0b0b0a] via-[#0b0b0a]/70 to-transparent md:h-40 md:via-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-[1440px]">
            <div className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#c99558] sm:mb-12"><span className="h-px w-8 bg-[#c99558]" />Perfumería árabe · Envíos a todo el país</div>
            <div className="max-w-3xl"><h1 aria-label="El aroma te precede." className="font-serif text-[clamp(4.4rem,12vw,10rem)] leading-[.82] tracking-[-0.08em]"><AnimatedLetters text="El aroma" /><br /><i className="font-light text-[#c99558]"><AnimatedLetters text="te precede." baseDelay={8 * LETTER_STAGGER} /></i></h1><p className="mt-6 max-w-[270px] text-sm leading-6 text-white/65 sm:mt-12">Fragancias que dejan una impresión antes de que llegues. Descubrí tu próxima firma olfativa.</p><a href="#coleccion" className="group mt-6 inline-flex min-h-[44px] w-fit items-center gap-3 rounded-full border border-white/30 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#c99558] hover:text-[#c99558] sm:mt-8">Ver colección <ArrowRight size={14} className="transition group-hover:translate-x-1" /></a></div>
            <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-5 text-[10px] uppercase tracking-[0.25em] text-white/40 sm:mt-16"><span>01 — Odyssey Limited</span><span className="flex items-center gap-2"><ArrowDown size={13} /> Deslizá para descubrir</span></div>
          </div>
        </section>

        {marqueeBrands.length > 0 && <div className="overflow-hidden border-y border-white/10 bg-[#c99558] py-3 text-black"><div className="marquee flex w-max gap-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.3em]">{Array.from({ length: 2 }).map((_, index) => <span key={index}>{marqueeBrands.join(' · ')} ·</span>)}</div></div>}

        <section id="coleccion" className="bg-[#e9e5dd] px-5 py-20 text-[#151412] md:px-12 md:py-28">
          <div className="mx-auto max-w-[1440px]"><div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#96724b]">La colección</p><h2 className="max-w-xl font-serif text-5xl leading-[.92] tracking-[-0.06em] md:text-7xl">Elegí la nota<br /><i className="font-light">que habla de vos.</i></h2></div><p className="max-w-xs text-sm leading-6 text-black/55">Cada perfume, una manera distinta de dejar huella. Diseñados para acompañarte, no para pasar desapercibidos.</p></div>
            <div className="mb-8 flex flex-wrap items-start gap-x-8 gap-y-3">{categoryMeta.map((meta) => { const active = !isSearching && activeCategory === meta.value; return <button key={meta.value} onClick={() => { setActiveCategory(meta.value); setActiveFamily('Todos'); setCatalogPage(1); setSearchQuery(''); }} className="group pb-1.5"><span className={`font-serif text-2xl italic tracking-[-0.02em] transition sm:text-3xl ${active ? 'text-[#151412]' : 'text-black/35 group-hover:text-black/60'}`}>{meta.label}</span><span className={`mt-1.5 block h-[2px] w-full transition-colors ${active ? 'bg-[#c99558]' : 'bg-transparent'}`} /></button>; })}</div>
            <div className="mb-8 flex flex-col divide-y divide-black/10 border-y border-black/10 sm:flex-row sm:divide-x sm:divide-y-0">
              <div className="relative flex flex-1 items-center gap-3 py-4">
                <Search size={15} className="shrink-0 text-black/35" />
                <input ref={searchInputRef} type="text" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCatalogPage(1); }} placeholder="Buscar por nombre..." className="w-full bg-transparent text-xs text-black placeholder:text-black/35 outline-none" />
              </div>
              <div className="flex flex-col gap-2 py-4 sm:w-72 sm:pl-8">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-black/55"><span>Precio</span><span className="text-black/80">{formatPrice(effectivePriceRange[0])} – {formatPrice(effectivePriceRange[1])}</span></div>
                <div className="relative h-5">
                  <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-black/15" />
                  <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#c99558]" style={{ left: `${priceBounds[1] === priceBounds[0] ? 0 : ((effectivePriceRange[0] - priceBounds[0]) / (priceBounds[1] - priceBounds[0])) * 100}%`, right: `${priceBounds[1] === priceBounds[0] ? 0 : 100 - ((effectivePriceRange[1] - priceBounds[0]) / (priceBounds[1] - priceBounds[0])) * 100}%` }} />
                  <input type="range" aria-label="Precio mínimo" min={priceBounds[0]} max={priceBounds[1]} value={effectivePriceRange[0]} onChange={(event) => { const value = Number(event.target.value); setPriceRange([Math.min(value, effectivePriceRange[1]), effectivePriceRange[1]]); setCatalogPage(1); }} className="range-slider absolute inset-0 w-full" />
                  <input type="range" aria-label="Precio máximo" min={priceBounds[0]} max={priceBounds[1]} value={effectivePriceRange[1]} onChange={(event) => { const value = Number(event.target.value); setPriceRange([effectivePriceRange[0], Math.max(value, effectivePriceRange[0])]); setCatalogPage(1); }} className="range-slider absolute inset-0 w-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2 py-4 sm:w-64 sm:pl-8">
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/55">Para quién</span>
                <div className="flex flex-wrap gap-1.5">{genderMeta.map((gender) => { const active = activeGender === gender; return <button key={gender} onClick={() => toggleGender(gender)} className={`inline-flex min-h-[36px] items-center whitespace-nowrap rounded-full border px-3 text-[10px] uppercase tracking-[0.14em] transition-all duration-300 ease-out active:scale-90 ${active ? 'scale-105 border-[#c99558] bg-[#c99558] text-[#151412] shadow-[0_4px_14px_rgba(201,149,88,0.35)]' : 'border-black/20 text-black/55 hover:border-black/60'}`}>{gender}</button>; })}</div>
              </div>
            </div>
            {activeCategory === 'Perfume' && !isSearching && <div className="mb-12 flex gap-2 overflow-x-auto pb-2">{families.map((family) => <button key={family} onClick={() => setActiveFamilyAndResetPage(family)} className={`inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border px-4 text-[10px] uppercase tracking-[0.17em] transition ${activeFamily === family ? 'border-[#c99558] bg-[#c99558] text-[#151412]' : 'border-black/20 text-black/55 hover:border-black/60'}`}>{family}</button>)}</div>}
            {activeCategory === 'Combo' && !isSearching && <div className="mb-14">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#6b4a26]">Armá tu combo</p>
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="font-serif text-4xl tracking-[-0.03em] text-[#151412] md:text-6xl">2 perfumes + 1 body splash</h3>
                <span className="inline-flex items-center rounded-full bg-[#c99558] px-5 py-2.5 text-lg font-bold text-black md:text-2xl">{formatPrice(COMBO_PRICE)}</span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-black/55">Elegí 2 perfumes y 1 body splash Victoria's Secret. Los 3 juntos, a este precio fijo.</p>
              <div className="mt-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-black/70">Elegí 2 perfumes ({comboPerfumeIds.length}/2)</p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {comboPerfumeOptions.map((perfume, index) => {
                    const selected = comboPerfumeIds.includes(perfume.id);
                    const dimmed = !selected && comboPerfumeIds.length >= 2;
                    return <article key={perfume.id} onClick={() => openProduct(perfume, 'perfume')} className={`group relative min-h-[480px] cursor-pointer overflow-hidden p-7 text-white transition ${dimmed ? 'opacity-40' : ''} ${selected ? 'ring-2 ring-[#c99558] grayscale' : ''}`} style={{ background: `linear-gradient(145deg, ${perfume.accent}, #151515 120%)` }}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(255,255,255,.2),transparent_25%)] opacity-70" />
                      {selected && <span className="absolute left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#c99558] text-black"><Check size={16} /></span>}
                      <div className="relative z-10 flex h-full flex-col">
                        <div className="flex justify-end text-[10px] uppercase tracking-[0.2em] text-white/65"><span>{perfume.family}</span></div>
                        <div className="relative min-h-0 flex-1 py-3"><div className="flex h-full w-full animate-card-float items-center justify-center" style={{ '--float-delay': `${(index % 3) * -1.1}s` } as CSSProperties}><img src={perfume.image} alt={perfume.name} className="max-h-[260px] max-w-[85%] object-contain drop-shadow-[0_28px_25px_rgba(0,0,0,.48)] transition duration-700 group-hover:scale-105 group-hover:-translate-y-[6%]" /></div></div>
                        <div className="relative shrink-0"><p className="mb-2 text-xs text-white/65">{perfume.notes}</p><h3 className={`font-serif tracking-[-0.04em] ${perfume.name.length > 22 ? 'text-xl' : 'text-3xl'}`}>{perfume.name}</h3></div>
                      </div>
                    </article>;
                  })}
                </div>
              </div>
              <div className="mt-10 border-t border-black/10 pt-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-black/70">Elegí 1 body splash</p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {comboBodyOptions.map((perfume, index) => {
                    const selected = comboBodyId === perfume.id;
                    return <article key={perfume.id} onClick={() => openProduct(perfume, 'body')} className={`group relative min-h-[480px] cursor-pointer overflow-hidden p-7 text-white transition ${selected ? 'ring-2 ring-[#c99558] grayscale' : ''}`} style={{ background: `linear-gradient(145deg, ${perfume.accent}, #151515 120%)` }}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(255,255,255,.2),transparent_25%)] opacity-70" />
                      {selected && <span className="absolute left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#c99558] text-black"><Check size={16} /></span>}
                      <div className="relative z-10 flex h-full flex-col">
                        <div className="flex justify-end text-[10px] uppercase tracking-[0.2em] text-white/65"><span>{perfume.volume}</span></div>
                        <div className="relative min-h-0 flex-1 py-3"><div className="flex h-full w-full animate-card-float items-center justify-center" style={{ '--float-delay': `${(index % 3) * -1.1}s` } as CSSProperties}><img src={perfume.image} alt={perfume.name} className="max-h-[260px] max-w-[85%] object-contain drop-shadow-[0_28px_25px_rgba(0,0,0,.48)] transition duration-700 group-hover:scale-105 group-hover:-translate-y-[6%]" /></div></div>
                        <div className="relative shrink-0"><p className="mb-2 text-xs text-white/65">{perfume.notes}</p><h3 className={`font-serif tracking-[-0.04em] ${perfume.name.length > 22 ? 'text-xl' : 'text-3xl'}`}>{perfume.name}</h3></div>
                      </div>
                    </article>;
                  })}
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
                <span className="text-xl text-[#151412]">{formatPrice(COMBO_PRICE)}</span>
                <button onClick={addComboToCart} disabled={comboPerfumeIds.length < 2 || !comboBodyId} className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#c99558] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[#dba86c] disabled:cursor-not-allowed disabled:opacity-30">Agregar combo al carrito</button>
              </div>
            </div>}
            {paginatedPerfumes.length === 0 && <p className="mb-12 text-sm text-black/45">No encontramos productos con esos filtros. Probá ajustar la búsqueda, la categoría o el rango de precio.</p>}
            <div ref={catalogGridRef} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{paginatedPerfumes.map((perfume, index) => { const variants = getVariants(perfume); const selected = getSelectedVariant(perfume); const outOfStock = perfume.in_stock === false; return <article key={perfume.id} onClick={() => openProduct(perfume)} className={`group relative min-h-[480px] cursor-pointer overflow-hidden p-7 text-white ${outOfStock ? 'grayscale' : ''}`} style={{ background: `linear-gradient(145deg, ${perfume.accent}, #151515 120%)` }}><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(255,255,255,.2),transparent_25%)] opacity-70" /><div className="relative z-10 flex h-full flex-col"><div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-white/65"><span>{String((catalogPage - 1) * CATALOG_PAGE_SIZE + index + 1).padStart(2, '0')} / {String(visiblePerfumes.length).padStart(2, '0')}</span><span>{perfume.family}{perfume.gender ? ` · ${perfume.gender}` : ''}</span></div><div className="relative min-h-0 flex-1 py-3"><div className="flex h-full w-full animate-card-float items-center justify-center" style={{ '--float-delay': `${(index % 3) * -1.1}s` } as CSSProperties}><img src={selected.image} alt={selected.name} className="max-h-[260px] max-w-[85%] object-contain drop-shadow-[0_28px_25px_rgba(0,0,0,.48)] transition duration-700 group-hover:scale-105 group-hover:-translate-y-[6%]" /></div></div><div className="relative shrink-0"><p className="mb-2 text-xs text-white/65">{selected.notes}</p><h3 className={`font-serif tracking-[-0.04em] ${perfume.name.length > 22 ? 'text-xl' : 'text-3xl'}`}>{perfume.name}</h3>{variants.length > 1 &&<div onClick={(event) => event.stopPropagation()} className="mt-3 flex flex-wrap gap-1.5">{variants.map((variant) => <button key={variant.id} onClick={() => setSelectedVariantId((current) => ({ ...current, [perfume.id]: variant.id }))} className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] transition ${selected.id === variant.id ? 'border-white bg-white/20 text-white' : 'border-white/25 text-white/55 hover:border-white/50'}`}>{variant.name}</button>)}</div>}<div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4"><span className="text-sm">{formatPrice(perfume.price)}</span>{outOfStock ? <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">No disponible</span> : <button onClick={(event) => quickAdd(event, perfume)} className="inline-flex min-h-[44px] items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] transition hover:text-[#f2c891]"><Plus size={15} /> Agregar</button>}</div></div></div></article>; })}</div>
            {catalogTotalPages > 1 && <div className="mt-12 flex items-center justify-center gap-2 sm:gap-6">
              {catalogPage > 1 && <button onClick={(event) => { event.currentTarget.blur(); setCatalogPage((page) => Math.max(1, page - 1)); }} className="inline-flex min-h-[44px] items-center text-[10px] uppercase tracking-[0.2em] text-black/55 transition hover:text-black">Anterior</button>}
              <div className="flex items-center">{Array.from({ length: catalogTotalPages }, (_, i) => i + 1).map((page) => <button key={page} onClick={(event) => { event.currentTarget.blur(); setCatalogPage(page); }} aria-label={`Pagina ${page}`} className="relative flex h-11 w-8 items-center justify-center sm:w-11"><span className={`h-2 w-2 rounded-full transition ${page === catalogPage ? 'bg-[#151412]' : 'bg-black/20 hover:bg-black/40'}`} /></button>)}</div>
              {catalogPage < catalogTotalPages && <button onClick={(event) => { event.currentTarget.blur(); setCatalogPage((page) => Math.min(catalogTotalPages, page + 1)); }} className="inline-flex min-h-[44px] items-center text-[10px] uppercase tracking-[0.2em] text-black/55 transition hover:text-black">Siguiente</button>}
            </div>}
          </div>
        </section>

        <section className="bg-[#0b0b0a] px-5 py-20 md:px-12 md:py-28"><div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#c99558]">Encontrá tu familia</p><h2 className="font-serif text-5xl leading-[.92] tracking-[-0.06em] md:text-7xl">Una emoción<br /><i className="text-[#c99558]">en cada nota.</i></h2><p className="mt-8 max-w-xs text-sm leading-6 text-white/45">Cada familia cambia de voz, de textura y de energía. Dejá que el próximo aroma te encuentre.</p></div><div className="flex flex-col">{familySlides.map((family, index) => <article key={family.name} onClick={() => { setActiveCategory('Perfume'); setActiveFamilyAndResetPage(family.name); document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' }); }} className="group flex cursor-pointer items-center justify-between gap-6 border-t border-white/10 py-6 transition first:border-t-0 md:py-8"><div><div className="flex items-center gap-3 text-white/35"><Sparkles size={14} /><span className="text-[9px] uppercase tracking-[0.2em]">0{index + 1} / 04</span></div><h3 className="mt-2 font-serif text-4xl tracking-[-0.03em] text-white/55 transition group-hover:text-[#c99558] md:text-5xl"><i className="not-italic font-light group-hover:italic">{family.name}</i></h3><p className="mt-2 max-w-xs text-xs leading-5 text-white/40">{family.line}</p><p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-[#c99558]">{family.count} {family.count === 1 ? 'perfume' : 'perfumes'}</p></div>{family.images.length > 0 && <div className="relative h-32 w-32 shrink-0 opacity-60 transition duration-500 group-hover:scale-110 group-hover:opacity-100 md:h-48 md:w-48"><img key={family.images[familyImageIndex[index]]} src={family.images[familyImageIndex[index]]} alt="" className="h-full w-full object-contain animate-story-image" /></div>}</article>)}</div></div></section>

        <section id="historia" className="relative overflow-hidden transition-colors duration-700 md:min-h-[820px]" style={{ backgroundColor: storySlides[storyImageIndex].bg }}>
          <div className="absolute inset-x-0 top-0 z-10 h-1" style={{ backgroundColor: storySlides[storyImageIndex].accent }} />

          {/* Mobile/tablet: imagen en flujo normal, siempre visible arriba */}
          <div className="relative flex h-[48vh] min-h-[320px] items-center justify-center md:hidden" style={{ background: `radial-gradient(circle at 50% 40%, ${storySlides[storyImageIndex].accent}26, transparent 70%)` }}>
            <img key={`mobile-${storySlides[storyImageIndex].image}`} src={storySlides[storyImageIndex].image} alt={storySlides[storyImageIndex].name} className="h-full w-full object-contain p-8 drop-shadow-[0_30px_35px_rgba(0,0,0,.65)] animate-story-image" />
          </div>

          {/* Desktop: imagen superpuesta a pantalla completa con gradiente hacia el texto */}
          <div className={`absolute inset-0 hidden md:flex md:items-center ${storySlides[storyImageIndex].imageSide === 'left' ? 'justify-start' : 'justify-end'}`}><img key={storySlides[storyImageIndex].image} src={storySlides[storyImageIndex].image} alt={storySlides[storyImageIndex].name} className={`h-full w-[72%] object-contain px-12 py-4 drop-shadow-[0_30px_35px_rgba(0,0,0,.65)] animate-story-image ${storySlides[storyImageIndex].imageSide === 'left' ? 'object-left' : 'object-right'}`} /></div>
          <div className="absolute inset-0 hidden md:block" style={{ background: storySlides[storyImageIndex].gradient }} />

          <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-12 sm:py-16 md:flex md:min-h-[820px] md:items-center md:px-12 md:py-0"><div key={`story-text-${storyImageIndex}`} className={`max-w-xl ${storySlides[storyImageIndex].imageSide === 'left' ? 'md:ml-auto' : ''}`}><p className="mb-4 text-[10px] uppercase tracking-[0.3em] animate-story-text sm:mb-5" style={{ color: storySlides[storyImageIndex].accent }}>{storySlides[storyImageIndex].eyebrow}</p><h2 className="font-serif text-4xl leading-[.9] tracking-[-0.06em] sm:text-6xl sm:leading-[.88] md:text-8xl animate-story-text">{storySlides[storyImageIndex].titleTop}<br /><i className="font-light" style={{ color: storySlides[storyImageIndex].accent }}>{storySlides[storyImageIndex].titleBottom}</i></h2><p className="mt-6 max-w-sm text-base leading-7 text-white/55 animate-story-text sm:mt-8">{storySlides[storyImageIndex].phrase}</p><p className="mt-6 text-xs uppercase tracking-[0.16em] animate-story-text" style={{ color: storySlides[storyImageIndex].accent }}>{storySlides[storyImageIndex].note}</p><p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/35 animate-story-text">{storySlides[storyImageIndex].name}</p><div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/75 animate-story-text sm:mt-10"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20"><Check size={14} /></span> Originales · seleccionados con intención</div><div className="mt-10 flex items-center sm:mt-12">{storySlides.map((slide, index) => <button key={slide.image} aria-label={`Mostrar perfume ${index + 1}`} onClick={() => setStoryImageIndex(index)} className="flex h-11 w-11 items-center justify-center"><span className={`h-1.5 rounded-full transition-all ${index === storyImageIndex ? 'w-10' : 'w-1.5 bg-white/35'}`} style={index === storyImageIndex ? { backgroundColor: storySlides[storyImageIndex].accent } : {}} /></button>)}</div></div></div>
        </section>

        <section id="contacto" className="border-t border-white/10 bg-[#0b0b0a] px-5 py-16 md:px-12"><div className="mx-auto grid max-w-[1440px] gap-10 border-b border-white/10 pb-16 md:grid-cols-3"><div className="flex gap-4"><Truck className="text-[#c99558]" size={20} /><div><h3 className="text-sm">Envíos a todo el país</h3><p className="mt-2 text-xs text-white/45">Despachamos tu pedido con cuidado.</p></div></div><div className="flex gap-4"><Sparkles className="text-[#c99558]" size={20} /><div><h3 className="text-sm">100% originales</h3><p className="mt-2 text-xs text-white/45">Fragancias elegidas por su calidad.</p></div></div><div className="flex gap-4"><MessageCircle className="text-[#c99558]" size={20} /><div><h3 className="text-sm">Atención cercana</h3><p className="mt-2 text-xs text-white/45">Te ayudamos a encontrar tu aroma.</p></div></div></div><footer className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 pt-12 md:flex-row md:items-end"><div><p className="font-serif text-3xl tracking-[-0.05em]">A&G <span className="text-[#c99558]">Perfumes</span></p><p className="mt-3 text-xs text-white/35">Perfumería árabe · Buenos Aires</p></div><div className="flex items-center gap-5 text-white/45"><a href="#inicio" className="inline-flex min-h-[44px] items-center text-[10px] uppercase tracking-[0.2em] transition hover:text-white">Volver arriba</a><a href="https://www.instagram.com/giselafabiana.maidana/" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center"><Instagram size={17} /></a><a href={`https://wa.me/5491124578934?text=${encodeURIComponent('Hola A&G Perfumes! Quería hacer una consulta.')}`} target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center"><MessageCircle size={17} /></a></div></footer></section>
      </main>

      {selectedProduct && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 md:items-center md:p-4 animate-backdrop-pop" onClick={closeProduct}><div className={`w-full max-w-3xl ${isClosing ? 'animate-bubble-out' : 'animate-bubble-in'}`}><div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden text-white shadow-2xl md:grid md:max-h-[90dvh] md:grid-cols-2 md:grid-rows-[minmax(0,1fr)]" style={{ background: `linear-gradient(145deg, ${selectedProduct.accent}, #0b0b0a 130%)`, transform: dragY ? `translateY(${dragY}px)` : undefined, transition: isDragging ? 'none' : 'transform 0.25s ease-out' }} onClick={(event) => event.stopPropagation()}><div className="flex justify-center pb-1 pt-3 md:hidden" onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd} onTouchCancel={handleDragEnd}><div className="h-1 w-10 rounded-full bg-white/25" /></div><button onClick={closeProduct} aria-label="Cerrar" className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20"><X size={17} /></button><div className="relative flex h-[38dvh] shrink-0 items-center justify-center overflow-hidden p-6 sm:h-[42dvh] md:h-auto md:min-h-[360px] md:p-8" style={{ background: `radial-gradient(circle at 50% 45%, ${selectedProduct.accent}55, transparent 70%)` }} onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd} onTouchCancel={handleDragEnd}><div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 30% 70%, ${selectedProduct.accent}40, transparent 50%)` }} /><div className="relative z-10 flex h-full w-full scale-125 items-center justify-center"><img src={selectedModalVariant!.image} alt={selectedModalVariant!.name} className="h-full max-h-[430px] w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.6)] animate-product-float" /></div></div><div className="relative flex min-h-0 flex-1 flex-col md:overflow-hidden"><div className="absolute inset-0" style={{ background: 'linear-gradient(165deg, rgba(11,11,10,.62), rgba(11,11,10,.9))' }} /><div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain"><div className="p-6 pb-4 md:p-12 md:pb-6">{comboPickContext && <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#c99558]">{comboPickContext === 'perfume' ? `Para tu combo · perfume ${comboPickedInModal ? comboPerfumeIds.indexOf(selectedProduct.id) + 1 : Math.min(comboPerfumeIds.length + 1, 2)} de 2` : 'Para tu combo · body splash'}</p>}<p className="text-[10px] uppercase tracking-[0.25em] text-white/70">{selectedProduct.family}{selectedProduct.gender ? ` · ${selectedProduct.gender}` : ''}</p><h2 className={`mt-4 font-serif leading-[1.05] tracking-[-0.06em] ${selectedProduct.name.length > 22 ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'}`}>{selectedProduct.name}</h2><p className="mt-3 text-sm text-white/70">{selectedProduct.subtitle}</p>{selectedModalVariants.length > 1 && <div className="mt-5 flex flex-wrap gap-2">{selectedModalVariants.map((variant) => <button key={variant.id} onClick={() => setSelectedVariantId((current) => ({ ...current, [selectedProduct.id]: variant.id }))} className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition ${selectedModalVariant!.id === variant.id ? 'border-white bg-white/20 text-white' : 'border-white/25 text-white/55 hover:border-white/50'}`}>{variant.name}</button>)}</div>}<p className="mt-6 text-sm leading-6 text-white/85 sm:mt-8">{selectedProduct.description}</p><div className="my-6 border-y border-white/15 py-5 text-xs sm:my-8"><div className="flex justify-between"><span className="text-white/60">Notas</span><span className="text-right text-white/90">{selectedModalVariant!.notes}</span></div><div className="mt-4 flex justify-between"><span className="text-white/60">Tamaño</span><span className="text-white/90">{selectedProduct.volume}</span></div></div></div><div className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-white/10 bg-[#0b0b0a]/95 p-6 backdrop-blur-sm md:border-0 md:p-12 md:pt-6"><div className="flex items-center justify-between gap-4">{comboPickContext ? <>
  <span className="text-sm text-white/60">{comboPickFullInModal ? 'Ya elegiste 2 perfumes' : 'Precio incluido en el combo'}</span>
  <button onClick={() => !comboPickFullInModal && pickForCombo(selectedProduct, comboPickContext)} disabled={comboPickFullInModal} className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-40 ${comboPickedInModal ? 'border border-white/30 text-white hover:border-white/60' : 'bg-[#c99558] text-black hover:bg-[#dba86c]'}`}>{comboPickedInModal ? 'Quitar del combo' : 'Elegir para el combo'}</button>
</> : selectedOutOfStock ? <>
  <span className="text-xl text-white/50">{formatPrice(selectedProduct.price)}</span>
  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">No disponible</span>
</> : <>
  <span className="text-xl">{formatPrice(selectedProduct.price)}</span>
  <button onClick={() => addFromModal(selectedProduct, selectedModalVariant!)} className="rounded-full bg-[#c99558] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[#dba86c]">Agregar al carrito</button>
</>}</div></div></div></div></div></div></div>}

      {isCheckoutFormOpen && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4" onClick={() => setIsCheckoutFormOpen(false)}><div className="mx-auto my-8 w-full max-w-sm rounded-2xl bg-[#0b0b0a] p-6 text-white shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Tus datos</h2><button onClick={() => setIsCheckoutFormOpen(false)} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"><X size={16} /></button></div><p className="mt-2 text-xs leading-5 text-white/50">Así tu pedido llega completo a WhatsApp, sin tener que escribirlo vos en el chat.</p><div className="mt-6 space-y-4"><div><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">Nombre y apellido</label><input type="text" value={checkoutInfo.name} onChange={(event) => setCheckoutInfo((info) => ({ ...info, name: event.target.value }))} placeholder="Tu nombre" className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-[#c99558]" /></div><div><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">Entrega</label><div className="mt-2 flex gap-2"><button type="button" onClick={() => setCheckoutInfo((info) => ({ ...info, deliveryMethod: 'mano' }))} className={`flex-1 rounded-xl border px-3 py-3 text-left text-xs transition ${checkoutInfo.deliveryMethod === 'mano' ? 'border-[#c99558] bg-[#c99558]/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}>En mano<span className="mt-0.5 block text-[10px] text-white/40">Zona Norte / CABA</span></button><button type="button" onClick={() => setCheckoutInfo((info) => ({ ...info, deliveryMethod: 'correo' }))} className={`flex-1 rounded-xl border px-3 py-3 text-left text-xs transition ${checkoutInfo.deliveryMethod === 'correo' ? 'border-[#c99558] bg-[#c99558]/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}>Por correo<span className="mt-0.5 block text-[10px] text-white/40">Todo el país</span></button></div></div>{checkoutInfo.deliveryMethod === 'mano' && <div><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">Zona / barrio</label><input type="text" value={checkoutInfo.zone} onChange={(event) => setCheckoutInfo((info) => ({ ...info, zone: event.target.value }))} placeholder="Ej: Olivos, Vicente López..." className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-[#c99558]" /></div>}{checkoutInfo.deliveryMethod === 'correo' && <><div><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">Calle y número</label><input type="text" value={checkoutInfo.street} onChange={(event) => setCheckoutInfo((info) => ({ ...info, street: event.target.value }))} placeholder="Ej: Av. Siempre Viva 742" className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-[#c99558]" /></div><div><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">Piso / depto (opcional)</label><input type="text" value={checkoutInfo.floor} onChange={(event) => setCheckoutInfo((info) => ({ ...info, floor: event.target.value }))} placeholder="Ej: 3B" className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-[#c99558]" /></div><div className="flex gap-3"><div className="flex-[2]"><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">Localidad</label><input type="text" value={checkoutInfo.city} onChange={(event) => setCheckoutInfo((info) => ({ ...info, city: event.target.value }))} placeholder="Ej: Olivos" className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-[#c99558]" /></div><div className="flex-1"><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">CP</label><input type="text" value={checkoutInfo.postalCode} onChange={(event) => setCheckoutInfo((info) => ({ ...info, postalCode: event.target.value }))} placeholder="1636" className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-[#c99558]" /></div></div><div><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">Provincia</label><select value={checkoutInfo.province} onChange={(event) => setCheckoutInfo((info) => ({ ...info, province: event.target.value }))} className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white outline-none focus:border-[#c99558]"><option value="" className="bg-[#0b0b0a]">Elegí una provincia</option>{ARGENTINE_PROVINCES.map((province) => <option key={province} value={province} className="bg-[#0b0b0a]">{province}</option>)}</select></div><p className="text-[11px] leading-4 text-white/40">El costo del envío es aparte y lo coordinamos por WhatsApp según tu localidad.</p></>}<div><label className="text-[10px] uppercase tracking-[0.18em] text-white/50">Email (opcional)</label><input type="email" value={checkoutInfo.email} onChange={(event) => setCheckoutInfo((info) => ({ ...info, email: event.target.value }))} placeholder="tu@email.com" className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-[#c99558]" /></div></div><a href={canSubmitCheckout ? whatsappCartLink : undefined} onClick={(event) => { if (!canSubmitCheckout) { event.preventDefault(); return; } trackWhatsappCheckout(); setIsCheckoutFormOpen(false); }} target="_blank" rel="noreferrer" className={`mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#1f7a4c] py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#17633d] ${canSubmitCheckout ? '' : 'pointer-events-none opacity-40'}`}><MessageCircle size={16} /> Continuar a WhatsApp</a></div></div>}

      <div className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#eee9e0] text-[#151412] shadow-2xl transition-transform duration-500 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}><div className="flex items-center justify-between border-b border-black/10 p-6"><div><p className="text-[10px] uppercase tracking-[0.22em] text-black/45">Tu selección</p><h2 className="mt-1 font-serif text-3xl">Carrito <span className="text-base text-black/45">({cartCount})</span></h2></div><button aria-label="Cerrar carrito" onClick={() => setIsCartOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"><X /></button></div><div className="flex-1 overflow-y-auto overscroll-y-contain p-6">{cart.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><ShoppingBag className="mb-5 text-black/25" size={30} /><p className="font-serif text-2xl">Tu carrito está vacío.</p><p className="mt-3 max-w-[220px] text-xs leading-5 text-black/45">Sumá una fragancia y empezá a construir tu próxima firma.</p><a href="#coleccion" onClick={() => setIsCartOpen(false)} className="mt-7 inline-flex min-h-[44px] items-center rounded-full bg-[#151412] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white">Ver colección</a></div> : <div className="space-y-5">{cart.map((item) => {
  const quantityControls = <div className="flex items-center gap-3 text-xs"><button aria-label="Restar" onClick={() => changeQuantity(item.product.id, item.variant.id, -1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/20 hover:border-black/40"><Minus size={11} /></button><span>{item.quantity}</span><button aria-label="Sumar" onClick={() => changeQuantity(item.product.id, item.variant.id, 1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/20 hover:border-black/40"><Plus size={11} /></button></div>;
  if (item.variant.images && item.variant.names) {
    return <div key={`${item.product.id}-${item.variant.id}`} className="border-b border-black/10 pb-5">
      <div className="flex justify-between gap-3"><h3 className="font-serif text-xl leading-none">{item.product.name}</h3><span className="text-sm">{formatPrice(item.product.price * item.quantity)}</span></div>
      <div className="mt-4 space-y-3">{item.variant.images.map((image, imageIndex) => <div key={imageIndex} className="flex items-center gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#1a1b19]"><img src={image} alt="" className="h-full w-full object-contain" /></div><span className="text-sm text-black/80">{item.variant.names![imageIndex]}</span></div>)}</div>
      <div className="mt-4">{quantityControls}</div>
    </div>;
  }
  return <div key={`${item.product.id}-${item.variant.id}`} className="flex gap-4 border-b border-black/10 pb-5"><div className="flex h-24 w-24 shrink-0 items-center justify-center bg-[#1a1b19]"><img src={item.variant.image} alt={variantLabel(item.product, item.variant)} className="h-full w-full object-contain" /></div><div className="flex flex-1 flex-col justify-between"><div className="flex justify-between gap-3"><h3 className="font-serif text-xl leading-none">{variantLabel(item.product, item.variant)}</h3><span className="text-sm">{formatPrice(item.product.price * item.quantity)}</span></div>{quantityControls}</div></div>;
})}</div>}</div>{cart.length > 0 && <div className="border-t border-black/10 p-6"><div className="mb-5 flex justify-between text-sm"><span className="text-black/50">Subtotal</span><span>{formatPrice(cartTotal)}</span></div><button onClick={() => { setIsCartOpen(false); setIsCheckoutFormOpen(true); }} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1f7a4c] py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#17633d]"><MessageCircle size={16} /> Finalizar por WhatsApp</button><p className="mt-4 text-center text-[10px] leading-4 text-black/40">Te pedimos tus datos y después se abre WhatsApp con el pedido ya armado.</p></div>}</div>
      {isCartOpen && <button aria-label="Cerrar panel" onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-40 bg-black/45" />}

      {toast && <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-5"><div className="animate-toast-in flex items-center gap-3 rounded-full border border-white/15 bg-[#151412]/95 px-5 py-3 text-xs text-white shadow-2xl backdrop-blur-md"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c99558] text-black"><Check size={12} /></span>{toast}</div></div>}
    </div>
  );
}

export default App;
