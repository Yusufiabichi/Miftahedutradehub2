
export default function WhatsAppButton() {
  const phoneNumber = '2348034567890';
  const message = 'Hello! I would like to know more about your services.';
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center cursor-pointer group"
      aria-label="Contact us on WhatsApp"
    >
      <i className="ri-whatsapp-line text-3xl"></i>
      <span className="absolute right-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Chat with us
      </span>
    </button>
  );
}
