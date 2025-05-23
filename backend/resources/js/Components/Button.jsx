export default function Button({ children, type = 'create', typeAttr = 'button', className = '', ...props }) {
    const base = "inline-block px-4 py-2 text-sm font-semibold rounded shadow transition";
    const variants = {
        create: "bg-[--forest-green] text-white hover:bg-green-700",
        update: "bg-teal-600 text-white hover:bg-teal-700",
        delete: "bg-red-600 text-white hover:bg-red-700",
        edit: "bg-indigo-600 text-white hover:bg-indigo-700",
        detail: "bg-slate-500 text-white rounded hover:bg-slate-700",
        cancel: "bg-gray-300 text-gray-700 hover:bg-gray-400",
    };

    return (
        <button type={typeAttr} className={`${base} ${variants[type]} ${className}`} {...props}>
            {children}
        </button>
    );
}
