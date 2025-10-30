import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2.5rem',
				'2xl': '3rem'
			},
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					from: {
						transform: 'translateX(-100%)'
					},
					to: {
						transform: 'translateX(0)'
					}
				},
				'panel-expand': {
					from: {
						width: 'var(--panel-collapsed-width, 320px)',
						opacity: '0.8'
					},
					to: {
						width: 'var(--panel-expanded-width, 600px)',
						opacity: '1'
					}
				},
				'panel-collapse': {
					from: {
						width: 'var(--panel-expanded-width, 600px)',
						opacity: '1'
					},
					to: {
						width: 'var(--panel-collapsed-width, 320px)',
						opacity: '0.8'
					}
				},
				'panel-slide-in': {
					from: {
						opacity: '0',
						transform: 'translateX(-100%) scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'translateX(0) scale(1)'
					}
				},
				'content-fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'tab-switch': {
					from: {
						opacity: '0',
						transform: 'translateY(5px) scale(0.98)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'stagger-in': {
					from: {
						opacity: '0',
						transform: 'translateY(15px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'bounce-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.3) translateY(-20px)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.05) translateY(0)'
					},
					'70%': {
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-5px)'
					}
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px hsl(var(--primary) / 0.2)'
					},
					'50%': {
						boxShadow: '0 0 20px hsl(var(--primary) / 0.4), 0 0 30px hsl(var(--primary) / 0.2)'
					}
				},
				'layout-transition': {
					from: {
						opacity: '0.8',
						transform: 'scale(0.98)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'panel-hide': {
					from: {
						opacity: '1',
						transform: 'translateX(0) scale(1)'
					},
					to: {
						opacity: '0',
						transform: 'translateX(-20px) scale(0.95)'
					}
				},
				'panel-show': {
					from: {
						opacity: '0',
						transform: 'translateX(20px) scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'translateX(0) scale(1)'
					}
				},
				'touch-press': {
					'0%': {
						transform: 'scale(1)'
					},
					'50%': {
						transform: 'scale(0.95)'
					},
					'100%': {
						transform: 'scale(1)'
					}
				},
				'touch-ripple': {
					'0%': {
						transform: 'scale(0)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(4)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'panel-expand': 'panel-expand 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'panel-collapse': 'panel-collapse 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'panel-slide-in': 'panel-slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
				'content-fade-in': 'content-fade-in 0.3s ease-out',
				'tab-switch': 'tab-switch 0.2s ease-out',
				'stagger-in': 'stagger-in 0.4s ease-out',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'layout-transition': 'layout-transition 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'panel-hide': 'panel-hide 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'panel-show': 'panel-show 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'touch-press': 'touch-press 0.2s ease-out',
				'touch-ripple': 'touch-ripple 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
