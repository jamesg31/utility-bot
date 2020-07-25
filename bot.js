const Discord = require('discord.js')
const client = new Discord.Client();
var config = require('./config.json');

const prefix = config.prefix;
const embedColor = config.embed_color;

var previous = null;

const announce = () => {
    if (previous != null) {
        previous.delete()
    }
    const autoembed = new Discord.MessageEmbed()
        autoembed.setColor(embedColor)
        autoembed.setTitle(config.auto_message.title)
        autoembed.setDescription(config.auto_message.body)
        if (config.auto_message.image) {
            autoembed.setImage(config.auto_message.image_url)
        }
        if (config.auto_message.thumbnail) {
            autoembed.setImage(config.auto_message.thumbnail_url)
        }
        autoembed.setFooter(client.guilds.cache.get(config.guild_id).name, client.guilds.cache.get(config.guild_id).iconURL())
        autoembed.setTimestamp()
    client.channels.fetch(config.auto_message.channel).then(channel => {
        channel.send(autoembed).then(message => {
            previous = message;
        })
    });
}

client.on('ready', () => {
    console.log('Bot online and running.')
    if (config.auto_message.enabled) {
        announce()
        setInterval(announce, config.auto_message.delay)
    }
})

client.on('guildMemberAdd', (member) => {
    welcome_body = config.welcome_messages.body.replace('${tag}', '<@' + member.id + '>').replace('${username}', member.displayName)
    welcome_title = config.welcome_messages.title.replace('${tag}', '<@' + member.id + '>').replace('${username}', member.displayName)
    const welcomeembed = new Discord.MessageEmbed()
        welcomeembed.setColor(embedColor)
        welcomeembed.setTitle(welcome_title)
        welcomeembed.setDescription(welcome_body)
        if (config.welcome_messages.thumbnail) {
            welcomeembed.setThumbnail(config.welcome_messages.thumbnail_url)
        }
        if (config.welcome_messages.image) {
            welcomeembed.setImage(config.welcome_messages.image_url)
        }
        welcomeembed.setFooter(member.guild.name, member.guild.iconURL())
        welcomeembed.setTimestamp()
    client.channels.fetch(config.welcome_messages.channel).then(channel => {channel.send(welcomeembed)});
})

client.on("message", (message) => {
    if (message.content.toLowerCase().startsWith(prefix + `a`)) {
        if (message.member.hasPermission("ADMINISTRATOR")) {
            message.author.createDM().then(dmchannel => {
                message.delete()    

                const embed0 = new Discord.MessageEmbed()
                    .setColor(embedColor)
                    .setTitle('New Announcement')
                    .setDescription('This will guide you through the message creation process. Please answer each question. Type !cancel at any time to stop the process.')
                    .setFooter(message.guild.name, message.guild.iconURL())
                    .setTimestamp()
                dmchannel.send(embed0);

                const embed1 = new Discord.MessageEmbed()
                    .setColor(embedColor)
                    .setTitle('Set Title')
                    .setDescription('What would you like the title of the announcement to be? This will be displayed bold at the top.')
                    .setFooter(message.guild.name, message.guild.iconURL())
                    .setTimestamp()
                dmchannel.send(embed1 );

                const titlecollector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, { time: 30000 });
                titlecollector.on('collect', colmessage => {
                    title = colmessage.content
                    titlecollector.stop()

                    if (title == prefix + 'cancel') {
                        return;
                    }

                    const embed2 = new Discord.MessageEmbed()
                        .setColor(embedColor)
                        .setTitle('Set Body')
                        .setDescription('What would you like the body of the announcement to be? This is the main content.')
                        .setFooter(message.guild.name, message.guild.iconURL())
                        .setTimestamp()
                    dmchannel.send(embed2);
        
                    const descriptioncollector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, { time: 30000 });
                    descriptioncollector.on('collect', colmessage => {
                        description = colmessage.content
                        if (colmessage.attachments.size > 0) {
                            var attach = 1
                            attachments = Array.from(colmessage.attachments)[0][1]
                        } else {
                            var attach = 0
                        }
                        descriptioncollector.stop()

                        if (description == prefix + 'cancel') {
                            return;
                        }
                        
                        const embed3 = new Discord.MessageEmbed()
                            .setColor(embedColor)
                            .setTitle('Tags')
                            .setDescription('Who would you like to tag? Please type the **IDs** of the roles you would like to ping seperated by a space. You can also type everyone, or none to tag nobody.')
                            .setFooter(message.guild.name, message.guild.iconURL())
                            .setTimestamp()
                        dmchannel.send(embed3);

                        const tagcollector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, { time: 30000 });
                        tagcollector.on('collect', colmessage => {
                            tags = colmessage.content
                            tagcollector.stop()
        
                            if (tags == prefix + 'cancel') {
                                return;
                            }

                            const embed4 = new Discord.MessageEmbed()
                                .setColor(embedColor)
                                .setTitle(title)
                                .setDescription(description)
                                .setFooter(message.author.username, message.author.avatarURL())
                                .setTimestamp()
                            dmchannel.send(embed4);


                            const embed5 = new Discord.MessageEmbed()
                                .setColor(embedColor)
                                .setTitle('Please Confirm')
                                .setDescription('Above is what your announcement will look like. This will be sent in **#' + message.channel.name + '** and will tag **' + tags + '** \n Please reply ' + prefix + 'confirm to confirm, or ' + prefix + 'cancel to cancel.')
                                .setFooter(message.guild.name, message.guild.iconURL())
                                .setTimestamp()
                            dmchannel.send(embed5);

                            const finalcollector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, { time: 30000 });
                            finalcollector.on('collect', colmessage => {
                                confirmation = colmessage.content
                                
                                if (confirmation == prefix + 'cancel') {
                                    descriptioncollector.stop()
                                    return;
                                } else if (confirmation == prefix + 'confirm') {
                                    descriptioncollector.stop()
                                    if (tags.toLowerCase() != 'none') {
                                        tagmessage = ''
                                        tags = tags.split(' ')
                                        for (var tag of tags) {
                                            if (tag == 'everyone') {
                                                tagmessage = tagmessage + '@everyone '
                                                break;
                                            } else {
                                                tagmessage = tagmessage + '<@&' + tag + '> '
                                            }
                                        }
                                        message.channel.send(tagmessage)    
                                    }
                                    const finalembed = new Discord.MessageEmbed()
                                        finalembed.setColor(embedColor)
                                        finalembed.setTitle(title)
                                        finalembed.setDescription(description)
                                        if (attach == 1) {
                                        finalembed.setImage(attachments.url)
                                        }
                                        finalembed.setFooter(message.author.username, message.author.avatarURL())
                                        finalembed.setTimestamp()
                                    message.channel.send(finalembed);
                                }
                            })
                        })
                    })
                })
            });
        }
    };

    if (message.content.toLowerCase().startsWith(prefix + `a`)) {
        if (message.member.hasPermission("ADMINISTRATOR")) {
            message.author.createDM().then(dmchannel => {
                message.delete()    

                const embed0 = new Discord.MessageEmbed()
                    .setColor(embedColor)
                    .setTitle('New Announcement')
                    .setDescription('This will guide you through the message creation process. Please answer each question. Type !cancel at any time to stop the process.')
                    .setFooter(message.guild.name, message.guild.iconURL())
                    .setTimestamp()
                dmchannel.send(embed0);

                const embed1 = new Discord.MessageEmbed()
                    .setColor(embedColor)
                    .setTitle('Set Title')
                    .setDescription('What would you like the title of the announcement to be? This will be displayed bold at the top.')
                    .setFooter(message.guild.name, message.guild.iconURL())
                    .setTimestamp()
                dmchannel.send(embed1 );

                const titlecollector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, { time: 30000 });
                titlecollector.on('collect', colmessage => {
                    title = colmessage.content
                    titlecollector.stop()

                    if (title == prefix + 'cancel') {
                        return;
                    }

                    const embed2 = new Discord.MessageEmbed()
                        .setColor(embedColor)
                        .setTitle('Set Body')
                        .setDescription('What would you like the body of the announcement to be? This is the main content.')
                        .setFooter(message.guild.name, message.guild.iconURL())
                        .setTimestamp()
                    dmchannel.send(embed2);
        
                    const descriptioncollector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, { time: 30000 });
                    descriptioncollector.on('collect', colmessage => {
                        description = colmessage.content
                        if (colmessage.attachments.size > 0) {
                            var attach = 1
                            attachments = Array.from(colmessage.attachments)[0][1]
                        } else {
                            var attach = 0
                        }
                        descriptioncollector.stop()

                        if (description == prefix + 'cancel') {
                            return;
                        }
                        
                        const embed3 = new Discord.MessageEmbed()
                            .setColor(embedColor)
                            .setTitle('Tags')
                            .setDescription('Who would you like to tag? Please type the **IDs** of the roles you would like to ping seperated by a space. You can also type everyone, or none to tag nobody.')
                            .setFooter(message.guild.name, message.guild.iconURL())
                            .setTimestamp()
                        dmchannel.send(embed3);

                        const tagcollector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, { time: 30000 });
                        tagcollector.on('collect', colmessage => {
                            tags = colmessage.content
                            tagcollector.stop()
        
                            if (tags == prefix + 'cancel') {
                                return;
                            }

                            const embed4 = new Discord.MessageEmbed()
                                .setColor(embedColor)
                                .setTitle(title)
                                .setDescription(description)
                                .setFooter(message.author.username, message.author.avatarURL())
                                .setTimestamp()
                            dmchannel.send(embed4);


                            const embed5 = new Discord.MessageEmbed()
                                .setColor(embedColor)
                                .setTitle('Please Confirm')
                                .setDescription('Above is what your announcement will look like. This will be sent in **#' + message.channel.name + '** and will tag **' + tags + '** \n Please reply ' + prefix + 'confirm to confirm, or ' + prefix + 'cancel to cancel.')
                                .setFooter(message.guild.name, message.guild.iconURL())
                                .setTimestamp()
                            dmchannel.send(embed5);

                            const finalcollector = new Discord.MessageCollector(dmchannel, m => m.author.id === message.author.id, { time: 30000 });
                            finalcollector.on('collect', colmessage => {
                                confirmation = colmessage.content
                                
                                if (confirmation == prefix + 'cancel') {
                                    descriptioncollector.stop()
                                    return;
                                } else if (confirmation == prefix + 'confirm') {
                                    descriptioncollector.stop()
                                    if (tags.toLowerCase() != 'none') {
                                        tagmessage = ''
                                        tags = tags.split(' ')
                                        for (var tag of tags) {
                                            if (tag == 'everyone') {
                                                tagmessage = tagmessage + '@everyone '
                                                break;
                                            } else {
                                                tagmessage = tagmessage + '<@&' + tag + '> '
                                            }
                                        }
                                        message.channel.send(tagmessage)    
                                    }
                                    const finalembed = new Discord.MessageEmbed()
                                        finalembed.setColor(embedColor)
                                        finalembed.setTitle(title)
                                        finalembed.setDescription(description)
                                        if (attach == 1) {
                                        finalembed.setImage(attachments.url)
                                        }
                                        finalembed.setFooter(message.author.username, message.author.avatarURL())
                                        finalembed.setTimestamp()
                                    message.channel.send(finalembed);
                                }
                            })
                        })
                    })
                })
            });
        }
    };

    if (message.channel.id == config.suggestions.channel && config.suggestions.enabled && !message.author.bot) {
        const suggestembed = new Discord.MessageEmbed()
        .setColor(embedColor)
        .setAuthor(message.author.username, message.author.avatarURL())
        .setTitle(config.suggestions.header)
        .setDescription('```' + message.content + '```')
        .setFooter(message.guild.name, message.guild.iconURL())
        .setTimestamp()
        message.channel.send(suggestembed).then(suggest => {
            suggest.react('✅');
            suggest.react('❌');
            message.delete();
        })
    };
});

client.login(config.token);