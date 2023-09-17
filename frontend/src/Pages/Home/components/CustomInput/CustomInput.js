import * as React from "react";
import './style.css';

function CustomInput({
    className,
    containerStyle,
    errors,
    disabled,
    icon,
    inputStyle,
    name,
    onChange,
    placeholder,
    readOnly,
    required,
    type,
    value,
    wrapperStyle,
    validations}

) {
    const inputRef = React.useRef(null);

    const handleClick = () => {
        if (inputRef && inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="InputHolder">
            <div onClick={handleClick} className="container">
                <input 
                    ref={inputRef}
                    aria-label={name}
                    data-testid={name}
                    tabIndex={0}
                    type={type}
                    name={name}
                    onChange={onChange}
                    placeholder={placeholder}
                    value={value}
                    style={inputStyle}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={className}
                    validations={validations}
                />
            </div>
        </div>
    );
};


export default CustomInput;
