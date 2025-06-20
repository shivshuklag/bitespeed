import { Injectable } from '@nestjs/common';
import { CreateIdentityDto } from './dto/create_identity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { LinkPrecedence } from './enum/precedence.enum';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createIdentity(createIdentityDto: CreateIdentityDto) {
    const { email, phoneNumber } = createIdentityDto;

    if (!email && !phoneNumber) {
      throw new Error('Either email or phoneNumber must be provided');
    }

    // fetch all contacts
    const relatedContacts = await this.contactRepo.find({
      where: [
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
      order: { createdAt: 'ASC' },
    });

    // If no contact, create new one
    if (relatedContacts.length === 0) {
      const result = await this.contactRepo.insert({
        email,
        phoneNumber,
        linkPrecedence: LinkPrecedence.PRIMARY,
      });

      const newId = result.generatedMaps[0].id;
      return {
        contact: {
          primaryContatctId: newId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      };
    }

    // get all the linked contacts
    const contactIds = relatedContacts.map((c) => c.id);
    const linkedIds = relatedContacts
      .map((c) => (c.linkPrecedence === 'primary' ? c.id : c.linkedId))
      .filter(Boolean) as number[];

    const rootIds = Array.from(new Set([...contactIds, ...linkedIds]));

    const allLinkedContacts = await this.contactRepo.find({
      where: [{ id: In(rootIds) }, { linkedId: In(rootIds) }],
      order: { createdAt: 'ASC' },
    });

    // filter oldest primery identitity
    const primaries = allLinkedContacts.filter(
      (c) => c.linkPrecedence === 'primary',
    );
    const primary = primaries.reduce((oldest, current) =>
      oldest.createdAt < current.createdAt ? oldest : current,
    );

    // Update others as secondary  & their secondaries also as seconday
    const otherPrimaries = primaries.filter((p) => p.id !== primary.id);

    for (const p of otherPrimaries) {
      await this.contactRepo.update(p.id, {
        linkPrecedence: LinkPrecedence.SECONDARY,
        linkedId: primary.id,
      });
      await this.contactRepo.update(
        { linkedId: p.id },
        { linkedId: primary.id },
      );
    }

    // Check if new email or phone exists, if not create
    const allEmails = allLinkedContacts.map((c) => c.email).filter(Boolean);
    const allPhones = allLinkedContacts
      .map((c) => c.phoneNumber)
      .filter(Boolean);

    let newSecondaryId: number | null = null;

    const isNewEmail = email && !allEmails.includes(email);
    const isNewPhone = phoneNumber && !allPhones.includes(phoneNumber);

    if (isNewEmail || isNewPhone) {
      const result = await this.contactRepo.insert({
        email,
        phoneNumber,
        linkedId: primary.id,
        linkPrecedence: LinkPrecedence.SECONDARY,
      });
      newSecondaryId = result.generatedMaps[0].id;
    }

    // Generating final response
    const allContacts = await this.contactRepo.find({
      where: [{ id: primary.id }, { linkedId: primary.id }],
      order: { createdAt: 'ASC' },
    });

    const finalEmails = Array.from(
      new Set(allContacts.map((c) => c.email).filter(Boolean)),
    );
    const finalPhones = Array.from(
      new Set(allContacts.map((c) => c.phoneNumber).filter(Boolean)),
    );
    const secondaryContactIds = allContacts
      .filter((c) => c.id !== primary.id)
      .map((c) => c.id);

    if (newSecondaryId) {
      secondaryContactIds.push(newSecondaryId);
    }

    return {
      contact: {
        primaryContatctId: primary.id,
        emails: primary.email
          ? [primary.email, ...finalEmails.filter((e) => e !== primary.email)]
          : finalEmails,
        phoneNumbers: primary.phoneNumber
          ? [
              primary.phoneNumber,
              ...finalPhones.filter((p) => p !== primary.phoneNumber),
            ]
          : finalPhones,
        secondaryContactIds: Array.from(new Set(secondaryContactIds)),
      },
    };
  }
}
