import { SlashCommandBuilder } from 'discord.js';

const specText = `# KPI申請Bot 仕様書

■ 概要
KPI申請BotはDiscord上で店舗ごとの目標人数（KPI）を登録・報告できるBotです。

■ 主なコマンド
- /kpi_設定: 店舗追加・目標人数・日付を登録
- /kpi_設置: KPI報告用メッセージ表示と店舗選択

■ データファイル
- kpi_shops.json (店舗リスト)
- kpi_ninzuu.json (目標人数データ)

■ Render運用
- 永続ディスクを使って /data フォルダにJSON保存
- ポートバインド対応のHTTPサーバ実装

■ 今後の拡張案
- KPI報告モーダルの実装
- Slack連携や達成率計算表示など

（詳しい仕様書は開発者に問い合わせてください）`;

export const data = new SlashCommandBuilder()
  .setName('kpi_仕様書')
  .setDescription('KPI申請Botの仕様書を表示します');

export async function execute(interaction) {
  // Discordのメッセージ文字数制限（約2000文字）を考慮して分割も検討できますが、
  // 今回は1回のメッセージで送信します。
  await interaction.reply({ content: specText, ephemeral: true });
}
