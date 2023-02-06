export async function DiscordLogging(Message: string) {
    const Time = new Date()
    const Year = Time.getFullYear()
    const Month = Time.getMonth()
    const Day = Time.getDay()
    const Hour = Time.getHours()
    const Min = Time.getMinutes()
    const Sec = Time.getSeconds()

    const YearIntToString = ["January", "February", "March", "April", "May", "June", "Juli", "August", "September", "October", "November", "December"]
    const DayIntToString = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    console.log(`\n\r[Year: ${Year}][Month: ${YearIntToString[Month]}][Day: ${DayIntToString[Day]}][Time: ${Hour}:${Min}:${Sec}] ---  [ Message ]: ${Message} `)
}