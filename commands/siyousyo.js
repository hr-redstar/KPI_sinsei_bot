import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('kpi_仕様書')
  .setDescription('KPI申請Botの機能と使い方を表示します');

export async function execute(interaction) {
  try {
    // deferReply は使わず、直接 reply で返す
    await interaction.reply({
      content: `
📌 **KPI申請Bot 仕様書（要点）**

🔧 /kpi_設定
- 店舗名の追加（モーダル）
- 店舗ごとの目標人数を設定

📩 /kpi_設置
- 店舗・人数を選んで報告スレッドに投稿
- 達成率も自動で計算されます

🗃️ データファイル（Render上の永続ディスク）
- \`data/kpi_shops.json\`: 店舗リスト
- \`data/kpi_ninzuu.json\`: KPI設定履歴

✅ Render 対応済み。Persistent Disk によって再起動後もデータ保持

📎 詳細は GitHub または管理者まで。
      `,
      ephemeral: true,
    });
  } catch (error) {
    console.error('仕様書コマンド実行エラー:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '仕様書の表示に失敗しました。', ephemeral: true });
    }
  }
}
