import React from 'react';

const FormattedText = ({ text, className = '' }) => {
    return (
        <div className={className} style={{ whiteSpace: 'pre-wrap'}}>
            {text}
        </div>
    );
};

export default FormattedText;