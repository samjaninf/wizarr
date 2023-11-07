const resolveConfig = require('./resolve-config');
const axios = require('axios');

/**
 * @typedef {import('./types').Context} Context
 * @typedef {import('./types').Config} Config
 */

/**
 * @param {Config} pluginConfig -.
 * @param {Context} context -.
 * @example
 * success(pluginConfig, context)
 */
const success = (pluginConfig, context) => {

    const config = resolveConfig(pluginConfig, context);
    const { nextRelease, logger } = context;

    const version = nextRelease.name;
    const webhookUrl = config.webhookUrl;
    // remove everything up to the first ## heading
    const notes = nextRelease.notes.replace(/.*?##/s, '##');
    const url = `https://github.com/Wizarrrr/wizarr/releases/tag/${version}`;

    const parseNotes = (markdownText) => {
        const headerIndex = markdownText.search(/#+\s/);
        markdownText = markdownText.substring(headerIndex);
        markdownText = markdownText.replace(/\n\s+$/, '');
        markdownText = markdownText.replace(/#+\s/g, '');
        return markdownText;
    }

    // Check if version is a beta release
    const isBeta = version.includes("beta");

    const discordPayload = {
        embeds: [
            {
                title: `🚀 New ${isBeta ? 'Beta' : ''} Release [${version}] 🚀`,
                description: `We are excited to announce the release of **${version}** of our software! This ${isBeta ? 'beta' : ''} release comes with the following changes. 🎉`,
                fields: [
                    {
                        name: `What's New in this ${isBeta ? 'Beta' : ''} Release`,
                        value: parseNotes(notes)
                    },
                    {
                        name: `How to Get the ${isBeta ? 'Beta' : ''} Release`,
                        value: `To access the ${isBeta ? 'beta' : ''} release, simply pull the latest copy of our ${isBeta ? 'Beta' : ''} Docker Image. Your feedback ${isBeta ? 'on the beta' : ''} is crucial to helping us make this release even better, so please don't hesitate to reach out with any comments, questions, or bug reports.`
                    },
                    {
                        value: `${isBeta ? 'Thank you for being a part of our beta testing community, and we look forward to your feedback to make this release a success! 🙌' : 'Thank you for being a part of our community, and we look forward to your feedback! 🙌'}`
                    },
                    {
                        value: `${isBeta ? 'Happy testing! 🧪' : 'Happy updating! 🎉'}`
                    }
                ],
                url: url,
                color: 16728405,
                author: {
                    name: "Wizarr Github",
                    url: "https://github.com/Wizarrrr/wizarr",
                    icon_url: "https://avatars.githubusercontent.com/u/113373916"
                },
                footer: {
                    text: "Wizarr Team"
                },
                timestamp: new Date().toISOString(),
            }
        ],
        attachments: []
    };

    try {
        axios.post(webhookUrl, discordPayload);
        logger.log("Successfully sent Discord message.")
    } catch (error) {
        logger.error("Error sending Discord message:", error.message);
        throw error;
    }
}

module.exports = { success }
