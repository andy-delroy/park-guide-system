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
                    : 'text-white hover:bg-gray-100/10 hover:!text-[--secondary-contrast] focus:bg-gray-100/20') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
