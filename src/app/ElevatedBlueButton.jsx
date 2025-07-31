export default function ElevatedBlueButton({ children, onClick, type = "button", className = "", disabled = false, href }) {
  const baseClasses = "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const combinedClasses = `${baseClasses} ${className}`;
  
  const style = {
    backgroundColor: '#2563eb', // blue-600
    color: 'white',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  if (href) {
    return (
      <a href={href} style={style} className={combinedClasses}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={combinedClasses}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = '#1d4ed8'; // blue-700
          e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = '#2563eb'; // blue-600
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      {children}
    </button>
  );
}
