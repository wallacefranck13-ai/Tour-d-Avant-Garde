import { Injectable } from '@nestjs/common';
import { PrayerProgramsService } from '../prayer-programs/prayer-programs.service';
import { MeetingsService } from '../meetings/meetings.service';
import { WorldIntentionsService } from '../world-intentions/world-intentions.service';

/**
 * Le Veilleur — assistant IA de Tour d'Avant-Garde.
 * Sprint 1 : missions limitées et déterministes (accueillir, guider, recevoir une
 * requête, afficher le programme, rappeler les rencontres). Les capacités seront
 * enrichies progressivement (voir doc de cadrage, section "Le Veilleur").
 */
@Injectable()
export class VeilleurService {
  constructor(
    private readonly prayerPrograms: PrayerProgramsService,
    private readonly meetings: MeetingsService,
    private readonly worldIntentions: WorldIntentionsService,
  ) {}

  readonly menu = [
    ['1', 'Rejoindre la prière en cours'],
    ['2', 'Déposer une requête de prière'],
    ['3', 'Recevoir le programme du jour'],
    ['4', 'Voir la prochaine rencontre'],
    ['5', 'Envoyer un témoignage'],
    ['6', 'Parler à un responsable'],
  ] as const;

  private menuText() {
    return this.menu.map(([n, label]) => `${n}️⃣ ${label}`).join('\n');
  }

  // Mission : accueillir
  async accueillir(fullName: string) {
    return [
      '🛡️ Bienvenue sur Tour d\'Avant-Garde',
      '"Une prière s\'élève à chaque instant."',
      '',
      `Nous sommes heureux de vous accueillir, ${fullName}.`,
      'Veuillez choisir une option.',
      '',
      this.menuText(),
      '',
      'Répondez simplement par le numéro correspondant.',
    ].join('\n');
  }

  // Mission : guider
  guider() {
    return ["Je n'ai pas compris votre réponse.", 'Voici les options disponibles :', '', this.menuText()].join('\n');
  }

  // Mission : rejoindre la prière en cours
  async rejoindrePriere() {
    const session = await this.prayerPrograms.currentSession();
    if (!session) {
      return "Il n'y a pas de session de prière active pour le moment. Revenez au prochain programme ! 🙏";
    }
    const minutes = Math.floor(session.remainingSeconds / 60);
    const seconds = session.remainingSeconds % 60;
    return [
      `🙏 Vous rejoignez : ${session.program}`,
      `Étape en cours (${session.stepIndex}/${session.totalSteps}) : ${session.step}`,
      `Temps restant : ${minutes}:${String(seconds).padStart(2, '0')}`,
      '',
      'Que la grâce et la paix vous accompagnent pendant ce temps de prière.',
    ].join('\n');
  }

  // Mission : recevoir une requête (le message suivant de l'utilisateur est capté par WhatsappService)
  demanderRequete() {
    return 'Partagez votre requête de prière en un seul message. Nous la transmettrons aux intercesseurs. 🕊️';
  }

  confirmerRequete(subject: string) {
    return [
      'Votre requête a bien été reçue :',
      `« ${subject} »`,
      '',
      'Un intercesseur va s\'en saisir. Vous recevrez un suivi. 🙏',
    ].join('\n');
  }

  // Mission : afficher le programme du jour
  async afficherProgramme() {
    const [program, intention] = await Promise.all([this.prayerPrograms.findToday(), this.worldIntentions.findToday()]);
    const lines: string[] = [];
    if (program) {
      lines.push(`📖 Programme du jour : ${program.title}`);
      const steps = [...(program.steps ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
      steps.forEach((s) => lines.push(`  ${s.orderIndex}. ${s.title} (${s.durationMinutes} min)`));
    } else {
      lines.push("Aucun programme n'est publié pour aujourd'hui.");
    }
    lines.push('', `🌍 ${intention.title}`);
    intention.items.forEach((item) => lines.push(`- ${item}`));
    return lines.join('\n');
  }

  // Mission : rappeler les rencontres
  async rappelerRencontre() {
    const meeting = await this.meetings.findNext();
    if (!meeting) return "Aucune rencontre n'est programmée pour le moment.";
    const date = new Date(meeting.startAt);
    const formatted = date.toLocaleString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    return [`📅 Prochaine rencontre : ${meeting.title}`, `Quand : ${formatted}`, meeting.location ? `Où : ${meeting.location}` : undefined]
      .filter(Boolean)
      .join('\n');
  }

  demanderTemoignage() {
    return 'Nous serions heureux de lire votre témoignage. Écrivez-le en un seul message. ✨';
  }

  confirmerTemoignage() {
    return 'Merci pour ce témoignage ! Il sera partagé après validation par un responsable. 🙌';
  }

  demanderMessageResponsable() {
    return 'Décrivez votre besoin en un seul message, un responsable vous recontactera rapidement.';
  }

  confirmerMessageResponsable() {
    return 'Votre message a été transmis à un responsable. Merci pour votre patience. 🙏';
  }
}
