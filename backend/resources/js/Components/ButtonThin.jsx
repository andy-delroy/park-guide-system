export default function ButtonThin({ children, type = 'create', ...props }) {
    const variants = {
        create: "text-[--forest-green] hover:text-green-700",
        delete: "text-red-600 hover:text-red-700",
        edit: "text-indigo-600 hover:text-indigo-700",
        detail: "hover:text-slate-700 underline underline-offset-4 decoration-indigo-600 hover:decoration-slate-500 decoration-2",
        success: "text-green-600 hover:text-green-700",
    };

    return (
        <button className={`${variants[type]}`} {...props}>
            {children}
        </button>
    );
}
