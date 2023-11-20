import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin'

export const myCustomTheme: CustomThemeConfig = {
	name: 'my-custom-theme',
	properties: {
		// =~= Theme Properties =~=
		'--theme-font-family-base': `system-ui`,
		'--theme-font-family-heading': `system-ui`,
		'--theme-font-color-base': '0 0 0',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '4px',
		'--theme-rounded-container': '2px',
		'--theme-border-base': '1px',
		// =~= Theme On-X Colors =~=
		'--on-primary': '0 0 0',
		'--on-secondary': '0 0 0',
		'--on-tertiary': '0 0 0',
		'--on-success': '0 0 0',
		'--on-warning': '0 0 0',
		'--on-error': '255 255 255',
		'--on-surface': '255 255 255',
		// =~= Theme Colors  =~=
		// primary | #fe9ee9
		'--color-primary-50': '255 240 252', // #fff0fc
		'--color-primary-100': '255 236 251', // #ffecfb
		'--color-primary-200': '255 231 250', // #ffe7fa
		'--color-primary-300': '255 216 246', // #ffd8f6
		'--color-primary-400': '254 187 240', // #febbf0
		'--color-primary-500': '254 158 233', // #fe9ee9
		'--color-primary-600': '229 142 210', // #e58ed2
		'--color-primary-700': '191 119 175', // #bf77af
		'--color-primary-800': '152 95 140', // #985f8c
		'--color-primary-900': '124 77 114', // #7c4d72
		// secondary | #a883b6
		'--color-secondary-50': '242 236 244', // #f2ecf4
		'--color-secondary-100': '238 230 240', // #eee6f0
		'--color-secondary-200': '233 224 237', // #e9e0ed
		'--color-secondary-300': '220 205 226', // #dccde2
		'--color-secondary-400': '194 168 204', // #c2a8cc
		'--color-secondary-500': '168 131 182', // #a883b6
		'--color-secondary-600': '151 118 164', // #9776a4
		'--color-secondary-700': '126 98 137', // #7e6289
		'--color-secondary-800': '101 79 109', // #654f6d
		'--color-secondary-900': '82 64 89', // #524059
		// tertiary | #4b3d5c
		'--color-tertiary-50': '228 226 231', // #e4e2e7
		'--color-tertiary-100': '219 216 222', // #dbd8de
		'--color-tertiary-200': '210 207 214', // #d2cfd6
		'--color-tertiary-300': '183 177 190', // #b7b1be
		'--color-tertiary-400': '129 119 141', // #81778d
		'--color-tertiary-500': '75 61 92', // #4b3d5c
		'--color-tertiary-600': '68 55 83', // #443753
		'--color-tertiary-700': '56 46 69', // #382e45
		'--color-tertiary-800': '45 37 55', // #2d2537
		'--color-tertiary-900': '37 30 45', // #251e2d
		// success | #84cc16
		'--color-success-50': '237 247 220', // #edf7dc
		'--color-success-100': '230 245 208', // #e6f5d0
		'--color-success-200': '224 242 197', // #e0f2c5
		'--color-success-300': '206 235 162', // #ceeba2
		'--color-success-400': '169 219 92', // #a9db5c
		'--color-success-500': '132 204 22', // #84cc16
		'--color-success-600': '119 184 20', // #77b814
		'--color-success-700': '99 153 17', // #639911
		'--color-success-800': '79 122 13', // #4f7a0d
		'--color-success-900': '65 100 11', // #41640b
		// warning | #EAB308
		'--color-warning-50': '252 244 218', // #fcf4da
		'--color-warning-100': '251 240 206', // #fbf0ce
		'--color-warning-200': '250 236 193', // #faecc1
		'--color-warning-300': '247 225 156', // #f7e19c
		'--color-warning-400': '240 202 82', // #f0ca52
		'--color-warning-500': '234 179 8', // #EAB308
		'--color-warning-600': '211 161 7', // #d3a107
		'--color-warning-700': '176 134 6', // #b08606
		'--color-warning-800': '140 107 5', // #8c6b05
		'--color-warning-900': '115 88 4', // #735804
		// error | #D41976
		'--color-error-50': '249 221 234', // #f9ddea
		'--color-error-100': '246 209 228', // #f6d1e4
		'--color-error-200': '244 198 221', // #f4c6dd
		'--color-error-300': '238 163 200', // #eea3c8
		'--color-error-400': '225 94 159', // #e15e9f
		'--color-error-500': '212 25 118', // #D41976
		'--color-error-600': '191 23 106', // #bf176a
		'--color-error-700': '159 19 89', // #9f1359
		'--color-error-800': '127 15 71', // #7f0f47
		'--color-error-900': '104 12 58', // #680c3a
		// surface | #2d1e33
		'--color-surface-50': '224 221 224', // #e0dde0
		'--color-surface-100': '213 210 214', // #d5d2d6
		'--color-surface-200': '203 199 204', // #cbc7cc
		'--color-surface-300': '171 165 173', // #aba5ad
		'--color-surface-400': '108 98 112', // #6c6270
		'--color-surface-500': '45 30 51', // #2d1e33
		'--color-surface-600': '41 27 46', // #291b2e
		'--color-surface-700': '34 23 38', // #221726
		'--color-surface-800': '27 18 31', // #1b121f
		'--color-surface-900': '22 15 25', // #160f19
	},
}
