import colors from 'colors';
export async function DiscordLogging(Message) {
    const Time = new Date();
    const Year = Time.getFullYear();
    const Month = Time.getMonth();
    const Day = Time.getDay();
    const Hour = Time.getHours();
    const Min = Time.getMinutes();
    const Sec = Time.getSeconds();
    const YearIntToString = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const DayIntToString = ["", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    console.log(colors.gray(`\n\r[${Year}.${YearIntToString[Month]}.${DayIntToString[Day]}]-[Time: ${Hour}:${Min}:${Sec}]-[ ${Message} ]`));
}
