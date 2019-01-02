export default function formatDate(date?: Date): string {
    if (!date) {
        return '-';
    } else if (date.getDate() !== new Date().getDate()) {
        return date.toLocaleDateString();
    } else {
        return date.toLocaleTimeString();
    }
}
