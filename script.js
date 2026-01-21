document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const rSlider = document.getElementById('r-slider');
    const gSlider = document.getElementById('g-slider');
    const bSlider = document.getElementById('b-slider');

    const rValueSpan = document.getElementById('r-value');
    const gValueSpan = document.getElementById('g-value');
    const bValueSpan = document.getElementById('b-value');

    const hexInput = document.getElementById('hex-input');
    const decimalInput = document.getElementById('decimal-input');
    const rgbInput = document.getElementById('rgb-input');

    const colorPreview = document.getElementById('color-preview');
    const colorPreviewHex = document.getElementById('color-preview-hex');
    
    const copyButtons = document.querySelectorAll('.copy-button');
    const eyedropperButton = document.getElementById('eyedropper-button');
    const eyedropperContainer = document.getElementById('eyedropper-container');

    // --- COLOR CONVERSION UTILITIES ---
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    const rgbToHex = (r, g, b) => {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    };

    const rgbToDecimal = (r, g, b) => {
        return (r << 16) + (g << 8) + b;
    };

    const decimalToRgb = (decimal) => {
        const r = (decimal >> 16) & 255;
        const g = (decimal >> 8) & 255;
        const b = decimal & 255;
        return { r, g, b };
    };

    // --- STATE & UI UPDATE LOGIC ---
    const updateUI = (source = 'init') => {
        const r = parseInt(rSlider.value, 10);
        const g = parseInt(gSlider.value, 10);
        const b = parseInt(bSlider.value, 10);

        // Update RGB value spans
        rValueSpan.textContent = r;
        gValueSpan.textContent = g;
        bValueSpan.textContent = b;
        
        // Calculate conversions
        const hex = rgbToHex(r, g, b);
        const decimal = rgbToDecimal(r, g, b);
        const rgb = `rgb(${r}, ${g}, ${b})`;
        
        // Update inputs (if not the source of the change)
        if (source !== 'hex') hexInput.value = hex;
        if (source !== 'decimal') decimalInput.value = decimal.toString();
        rgbInput.value = rgb;

        // Update color preview
        colorPreview.style.backgroundColor = hex;
        colorPreviewHex.textContent = hex.toUpperCase();
    };

    // --- EVENT LISTENERS ---
    rSlider.addEventListener('input', () => updateUI('slider'));
    gSlider.addEventListener('input', () => updateUI('slider'));
    bSlider.addEventListener('input', () => updateUI('slider'));

    hexInput.addEventListener('input', () => {
        const rgb = hexToRgb(hexInput.value);
        if (rgb) {
            rSlider.value = rgb.r;
            gSlider.value = rgb.g;
            bSlider.value = rgb.b;
            updateUI('hex');
        }
    });

    decimalInput.addEventListener('input', () => {
        const decNum = parseInt(decimalInput.value, 10);
        if (!isNaN(decNum) && decNum >= 0 && decNum <= 16777215) {
            const { r, g, b } = decimalToRgb(decNum);
            rSlider.value = r;
            gSlider.value = g;
            bSlider.value = b;
            updateUI('decimal');
        }
    });
    
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetInput = document.getElementById(button.dataset.target);
            if (targetInput) {
                navigator.clipboard.writeText(targetInput.value).then(() => {
                    const copyIcon = button.querySelector('.icon-copy');
                    const checkIcon = button.querySelector('.icon-check');

                    copyIcon.classList.add('hidden');
                    checkIcon.classList.remove('hidden');

                    setTimeout(() => {
                        copyIcon.classList.remove('hidden');
                        checkIcon.classList.add('hidden');
                    }, 2000);
                });
            }
        });
    });

    // --- EYEDROPPER LOGIC ---
    if (!window.EyeDropper) {
        eyedropperContainer.classList.add('hidden');
    } else {
        const eyeDropper = new EyeDropper();
        
        eyedropperButton.addEventListener('click', async () => {
            try {
                const result = await eyeDropper.open();
                const hexValue = result.sRGBHex;
                
                // Update sliders based on picked color
                const rgb = hexToRgb(hexValue);
                if (rgb) {
                    rSlider.value = rgb.r;
                    gSlider.value = rgb.g;
                    bSlider.value = rgb.b;
                    updateUI('eyedropper');
                }
            } catch (err) {
                console.log('EyeDropper cancelled or failed:', err);
            }
        });
    }

    // --- INITIALIZATION ---
    updateUI();
});
