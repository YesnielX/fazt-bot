// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';

export default class NextCommand implements Command {
  names: Array<string> = ['next', 'siguiente', 'skip'];
  group: CommandGroup = 'music';
  description = 'Cambia a la siguiente canción (Si hay más de 2 oyentes se hará votación).';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, alias));
        return;
      }

      if (!message.member.voice.channel) {
        await sendMessage(message, 'debes estar en un canal de voz.', alias);
        return;
      }

      const queue = YouTube.queues[message.guild.id];
      if (!queue || !queue.playing || !queue.playingDispatcher) {
        await sendMessage(message, 'no estoy reproduciendo música.', alias);
        return;
      }

      if (!queue.voiceChannel.members.has(message.member.id)) {
        await sendMessage(message, 'no estás en el canal de voz.', alias);
        return;
      }

      if (!queue.songs[1]) {
        await sendMessage(message, 'no hay más canciones en la lista de reproducción', alias);
        return;
      }

      await YouTube.voteSystem(message, ['next', alias], (params[0] || '').toLowerCase() === 'forced');
    } catch (error) {
      console.error('Next song command', error);
    }
  }
}
