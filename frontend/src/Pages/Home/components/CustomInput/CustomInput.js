import * as React from "react";
import './style.css';
import { runValidations } from './validators';

function CustomInput({
    autoComplete,
    className,
    containerStyle,
    disabled,
    forceValidate,
    icon,
    inputStyle,
    name,
    onBlur,
    onChange,
    placeholder,
    readOnly,
    required,
    type,
    validations,
    value,
    wrapperStyle}

) {
    const inputRef = React.useRef(null);
    const [touched, setTouched] = React.useState(false);

    const error = runValidations(value, validations);
    const showError = (touched || forceValidate) && Boolean(error);
    const errorId = `${name}-error`;

    const handleClick = () => {
        if (inputRef && inputRef.current) inputRef.current.focus();
    };

    const handleBlur = (event) => {
        setTouched(true);
        if (onBlur) onBlur(event);
    };

    return (
        <div className="InputHolder">
            <div onClick={handleClick} className="container">
                <input
                    ref={inputRef}
                    aria-label={name}
                    aria-invalid={showError}
                    aria-describedby={showError ? errorId : undefined}
                    data-testid={name}
                    tabIndex={0}
                    type={type}
                    name={name}
                    autoComplete={autoComplete}
                    onChange={onChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    value={value}
                    style={inputStyle}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    className={`customInput ${className || ''}`.trim()}
                />
            </div>
            {showError && <div id={errorId} className="customInputError">{error}</div>}
        </div>
    );
};


export default CustomInput;
