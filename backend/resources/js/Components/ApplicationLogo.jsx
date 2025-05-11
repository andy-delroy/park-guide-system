export default function ApplicationLogo(props) {
   return (
        <img
            {...props}
            src="/storage/ino_logo.png" // or "/images/ino_logo.png"
            alt="Sarawak Parks Logo"
            className="h-16 w-auto"
        />
    ); 
}
