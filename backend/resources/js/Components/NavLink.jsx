import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'block w-full pl-12 py-3 text-base font-medium transition duration-150 ease-in-out focus:outline-none tracking-widest ' +
                (active
                    ? 'bg-[--secondary-contrast] text-white'
                    : 'text-white hover:bg-gray-300 hover:text-gray-700 focus:bg-gray-300 focus:text-gray-700') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
