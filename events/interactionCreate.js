export default {
  name: 'interactionCreate',
  async execute(interaction) {
    const { client } = interaction;

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        // deferReplyは外し、コマンド内で返信完結
        await command.execute(interaction);
      } catch (error) {
        console.error(`コマンド実行エラー [${interaction.user.tag}]:`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const { customId } = interaction;
      try {
        if (customId === 'openShopModal') {
          const modal = client.modals.get('shopModal');
          if (modal) await interaction.showModal(modal);
        } else if (customId.startsWith('shopSelect:')) {
          const handler = client.selects.get('shopTarget');
          if (handler) await handler(interaction);
        }
      } catch (error) {
        console.error('ボタン処理中のエラー:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'ボタン処理中にエラーが発生しました。', ephemeral: true });
        }
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      try {
        const handler = client.modals.get(interaction.customId);
        if (handler) await handler(interaction);
      } catch (error) {
        console.error('モーダル処理エラー:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'モーダル処理中にエラーが発生しました。', ephemeral: true });
        }
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      try {
        const handler = client.selects.get(interaction.customId);
        if (handler) await handler(interaction);
      } catch (error) {
        console.error('セレクトメニューエラー:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '選択メニューの処理中にエラーが発生しました。', ephemeral: true });
        }
      }
    }
  },
};
