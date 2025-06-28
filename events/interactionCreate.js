import {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

import { readShopList, addShop } from '../utils/kpiFileUtil.js';
import { handleKpiSettingModal } from '../commands/kpi_setting.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`コマンド実行エラー [${interaction.user.tag}]:`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'コマンド実行中にエラーが発生しました。',
            flags: 64,
          });
        }
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'kpi_add_shop_button') {
        if (interaction.replied || interaction.deferred) return;

        const modal = new ModalBuilder()
          .setCustomId('kpi_add_shop_modal')
          .setTitle('KPI 店舗名の追加');

        const shopNameInput = new TextInputBuilder()
          .setCustomId('shopName')
          .setLabel('追加する店舗名')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(shopNameInput));

        try {
          await interaction.showModal(modal);
        } catch (error) {
          console.error(`KPI 店舗追加モーダル表示エラー [${interaction.user.tag}]:`, error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'モーダルの表示に失敗しました。', flags: 64 });
          }
        }
        return;
      }

      if (interaction.customId === 'kpi_set_target_button') {
        if (interaction.replied || interaction.deferred) return;

        const shops = await readShopList();

        if (shops.length === 0) {
          await interaction.reply({ content: '店舗が登録されていません。まず店舗を追加してください。', flags: 64 });
          return;
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('kpi_shop_select')
          .setPlaceholder('店舗を選択してください（複数選択可）')
          .setMinValues(1)
          .setMaxValues(shops.length)
          .addOptions(
            shops.map(shop => ({
              label: shop,
              value: shop,
            })),
          );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
          content: '目標設定のために店舗を選択してください。',
          components: [row],
          flags: 64,
        });
        return;
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'kpi_add_shop_modal') {
        if (interaction.replied || interaction.deferred) return;

        const shopName = interaction.fields.getTextInputValue('shopName');
        const added = await addShop(shopName);

        if (!added) {
          await interaction.reply({ content: 'その店舗名は既に登録されています。', flags: 64 });
          return;
        }
        await interaction.reply({ content: `店舗名「${shopName}」を追加しました。`, flags: 64 });
        return;
      }

      if (interaction.customId === 'kpi_setting_modal') {
        const handled = await handleKpiSettingModal(interaction);
        if (handled) return;
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'kpi_shop_select') {
        const selectedShops = interaction.values;

        await interaction.reply({
          content: `選択された店舗: ${selectedShops.join(', ')}`,
          ephemeral: true,
        });
      }
    }
  },
};

