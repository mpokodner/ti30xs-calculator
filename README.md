# TI-30XS MultiView Scientific Calculator

A fully functional web-based replica of the Texas Instruments TI-30XS MultiView scientific calculator, built with vanilla HTML, CSS, and JavaScript.

## Features

### 🧮 Core Calculator Functions

- **Basic Arithmetic**: Addition, subtraction, multiplication, division
- **Scientific Functions**: Trigonometric, logarithmic, exponential functions
- **Memory Operations**: Store, recall, add to, subtract from memory
- **Fraction Support**: Fraction entry and mixed number operations
- **Constants**: π (pi) and e (Euler's number)
- **Powers and Roots**: Square, cube, nth power, square root, cube root, nth root

### 📊 Advanced Features

- **Statistics Mode**: One and two-variable statistics
- **Table Function**: Generate function tables
- **Constant Mode**: Repeat operations with constants
- **History**: View previous calculations
- **Multiple Display Modes**: Normal, Fixed, Scientific, Engineering notation

### 🎛️ Calculator Modes

- **2nd Mode**: Access secondary functions
- **HYP Mode**: Hyperbolic functions
- **Angle Modes**: Degrees, Radians, Gradians
- **Display Modes**: MathPrint and Classic formats

### ♿ Accessibility Features

- **Keyboard Support**: Full keyboard input for all operations
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **High Contrast Support**: Enhanced visibility for accessibility
- **Reduced Motion Support**: Respects user motion preferences

## Usage

### Basic Operations

1. **Turn on**: Click the `ON` button or press any number key
2. **Enter numbers**: Use number buttons (0-9) or keyboard
3. **Basic operations**: Use `+`, `−`, `×`, `÷` buttons
4. **Calculate**: Press `=` or `Enter` key
5. **Clear**: Use `CLEAR` to clear entry, `2nd` + `CLEAR` to clear all

### Scientific Functions

- **Trigonometric**: `sin`, `cos`, `tan` (use `2nd` for inverse functions)
- **Logarithmic**: `log` (base 10), `ln` (natural log)
- **Powers**: `x²`, `x³`, `^` for general exponentiation
- **Roots**: `√` for square root
- **Constants**: `π` and `e` buttons

### Memory Operations

- **Store**: `STO→` to store current result
- **Recall**: `RCL` to recall stored value
- **Add to Memory**: `M+` to add to stored value
- **Subtract from Memory**: `M-` to subtract from stored value

### Keyboard Shortcuts

| Key                | Function          |
| ------------------ | ----------------- |
| `0-9`              | Number input      |
| `.`                | Decimal point     |
| `+`, `-`, `*`, `/` | Basic operations  |
| `^`                | Power             |
| `(` `)`            | Parentheses       |
| `Enter` or `=`     | Calculate         |
| `Backspace`        | Delete character  |
| `Escape`           | Clear entry       |
| `Arrow Keys`       | Navigate cursor   |
| `Home`/`End`       | Move to start/end |

### Mode Settings

- **MODE**: Access calculator settings
- **FIX**: Set fixed decimal places
- **SCI**: Scientific notation
- **ENG**: Engineering notation
- **DEG/RAD/GRAD**: Angle unit selection

## Technical Implementation

### Architecture

- **Module Pattern**: Clean, encapsulated JavaScript code
- **Event-Driven**: Responsive button and keyboard handling
- **State Management**: Centralized calculator state
- **Error Handling**: Comprehensive error detection and display

### Key Components

#### HTML Structure

- Semantic HTML with proper accessibility attributes
- ARIA labels for screen readers
- Responsive button grid layout
- Status indicators for calculator modes

#### CSS Styling

- Authentic TI-30XS color scheme
- CSS Grid for button layout
- Smooth transitions and hover effects
- Responsive design for mobile devices
- High contrast mode support

#### JavaScript Features

- **Expression Parser**: Handles complex mathematical expressions
- **Order of Operations**: Implements PEMDAS correctly
- **Memory Management**: 7 memory variables (M, x, y, z, t, a, b, c)
- **History System**: Stores up to 8 previous calculations
- **Error Detection**: Division by zero, overflow, syntax errors

### File Structure

```
ti30xs-calculator/
├── index.html          # Main HTML structure
├── style.css           # Calculator styling
├── script.js           # Calculator functionality
└── README.md           # Documentation
```

## Browser Compatibility

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+

## Performance Features

- **Efficient Rendering**: Optimized display updates
- **Memory Management**: Proper cleanup and state management
- **Responsive Design**: Works on all screen sizes
- **Fast Calculations**: Optimized mathematical operations

## Error Handling

The calculator handles various error conditions:

- **SYNTAX ERROR**: Invalid mathematical expressions
- **DIVIDE BY 0**: Division by zero operations
- **DOMAIN ERROR**: Invalid inputs for functions (e.g., negative square root)
- **OVERFLOW ERROR**: Results too large to display
- **MEMORY ERROR**: Memory operation failures

## Future Enhancements

- [ ] Enhanced fraction operations with visual fraction display
- [ ] Complete statistics mode implementation
- [ ] Data editor for statistical data entry
- [ ] Table function with customizable ranges
- [ ] MathPrint™ display mode with proper mathematical notation
- [ ] Unit conversions
- [ ] Complex number support
- [ ] Programmable functions

## Contributing

This is a demonstration project showcasing web development skills. The calculator is designed to be educational and accessible while maintaining the authentic feel of the physical TI-30XS MultiView calculator.

## License

This project is for educational purposes. The TI-30XS MultiView is a trademark of Texas Instruments.

## Acknowledgments

- Texas Instruments for the original TI-30XS MultiView calculator design
- Mathematical functions implemented using JavaScript's Math object
- CSS Grid and Flexbox for responsive layout
- Modern web standards for accessibility and performance
