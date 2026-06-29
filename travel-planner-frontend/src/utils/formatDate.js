export const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun',
        'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
};