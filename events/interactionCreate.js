// events/interactionCreate.js

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    const { client } = interaction;

    // スラッシュコマンド
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await interaction.deferReply({ flags: 64 }); // 応答予約（ephemeral相当）
        await command.execute(interaction);
      } catch (error) {
        console.error(`コマンド実行エラー [${interaction.user.tag}]:`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', flags: 64 });
        }
      }
      return;
    }

    // モーダルの送信（ボタンから）
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
          await interaction.reply({ content: 'ボタン処理中にエラーが発生しました。', flags: 64 });
        }
      }
      return;
    }

    // モーダル入力送信時
    if (interaction.isModalSubmit()) {
      try {
        const handler = client.modals.get(interaction.customId);
        if (handler) await handler(interaction);
      } catch (error) {
        console.error('モーダル処理エラー:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'モーダル処理中にエラーが発生しました。', flags: 64 });
        }
      }
      return;
    }

    // セレクトメニュー（主に店舗選択）
    if (interaction.isStringSelectMenu()) {
      try {
        const handler = client.selects.get(interaction.customId);
        if (handler) await handler(interaction);
      } catch (error) {
        console.error('セレクトメニューエラー:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '選択メニューの処理中にエラーが発生しました。', flags: 64 });
        }
      }
    }
  },
};
