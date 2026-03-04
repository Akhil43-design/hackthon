/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./frontend/**/*.{html,js}",
        "./static/js/**/*.js"
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#2b6cee",
                "accent": "#ff6b6b",
                "background-light": "#f6f6f8",
                "background-dark": "#101622",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "full": "9999px"
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
