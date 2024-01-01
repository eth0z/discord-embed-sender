import fetch from 'node-fetch';
import readline from 'readline';

const webhookURL = process.env['WEBHOOK'];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter embed title: ', (title) => {
    const embed = { title };

    rl.question('Enter embed description: ', (description) => {
        embed.description = description;

        rl.question('Enter embed color (hex, no sharp): ', (color) => {
            embed.color = parseInt(color, 16);

            rl.question('Do you want to add a field? (y/n): ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                    rl.question('Enter field name: ', (fieldName) => {
                        const field = { name: fieldName };
                        rl.question('Enter field value: ', (fieldValue) => {
                            field.value = fieldValue;
                            if (!embed.fields) {
                                embed.fields = [field];
                            } else {
                                embed.fields.push(field);
                            }
                            sendEmbed(embed);
                        });
                    });
                } else {
                    sendEmbed(embed);
                }
            });
        });
    });
});

function sendEmbed(embed) {
    const data = { embeds: embed ? [embed] : [] };

    console.log('Sending data to webhook:');
    console.log(JSON.stringify(data));

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((response) => {
            if (!response.ok) {
                const jsonResponse = JSON.parse(response);
                const jsonMsg = jsonResponse.message;
                const jsonCode = jsonResponse.code;
                throw new Error(
                    'Failed to send message to webhook: Status code ' +
                    response.status +
                    ". Discord's API Responded with: " +
                    jsonMsg +
                    ' (Code: ' +
                    jsonCode +
                    '). ' +
                    'Please contact me via a method at http://eth0z.github.io/contact'
                );
            }
            console.log('Embed message sent successfully!');
            rl.close();
        })
        .catch((error) => {
            console.error('Error:', error);
            rl.close();
        });
}
