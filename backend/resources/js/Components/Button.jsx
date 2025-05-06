export default function Button({ children, type = 'primary', ...props }) {
    const base = "inline-block px-4 py-2 text-sm font-semibold rounded shadow transition";
    const variants = {
        primary: "bg-[--forest-green] text-white hover:bg-green-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
        info: "bg-indigo-600 text-white hover:bg-indigo-700",
        success:"bg-green-600 text-white rounded hover:bg-green-700"
    };

    return (
        <button className={`${base} ${variants[type]}`} {...props}>
            {children}
        </button>
    );
}
