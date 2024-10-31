function formatDate() {
    const now = new Date();

    // List of month names
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Get individual components in UTC
    const month = months[now.getUTCMonth()];
    const day = now.getUTCDate();
    const year = now.getUTCFullYear();
    let hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    // Construct the formatted date string
    const formattedDate = `${month} ${day}, ${year} ${hours}:${strMinutes} ${ampm} UTC`;
    
    return formattedDate;
}


module.exports = formatDate;