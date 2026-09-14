const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const token = process.env.TELEGRAM_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        { telegram_id: chatId, full_name: fullName, is_active: true },
        { onConflict: 'telegram_id' }
      );

    if (error) throw error;

    bot.sendMessage(chatId, `أهلاً بك يا ${fullName} في بوت مشروع أمير القرّاء الوطني!`);
  } catch (err) {
    console.error('Error:', err.message);
    bot.sendMessage(chatId, 'حدث خطأ أثناء الاتصال بقاعدة البيانات.');
  }
});

console.log('Bot is running...');
