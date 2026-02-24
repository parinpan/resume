export const parseLinks = (text: string) => {
    const urlRegex = /(https?:\/\/\S+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#222222' }}>
                    {part}
                </a>
            );
        }
        return part;
    });
};
