import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type VihiclesDocument = HydratedDocument<Vihicles>;

@Schema({ timestamps: true })
export class Vihicles {
  @Prop({ type: Number })
  num_wilaya: number;

  @Prop({ type: Number, index: true })
  num_docier_client: number;

  @Prop({ type: String })
  fullName_arabe: string;

  @Prop({ type: String })
  fullName_francais: string;

  @Prop({ type: String })
  activite: string;

  @Prop({ type: String })
  colonne1: string;

  @Prop({ type: String })
  nature_activite: string;

  @Prop({ type: String })
  colonne2: string;

  @Prop({ type: String })
  status_activite: string;

  @Prop({ type: String })
  colonne3: string;

  @Prop({ type: String, index: true })
  num_bus_registration: string;

  @Prop({ type: String })
  circle: string;

  @Prop({ type: String })
  Municipality: string;

  @Prop({ type: String })
  Style: string;

  @Prop({ type: String })
  category: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: Number })
  First_year_of_use: number;

  @Prop({ type: Number })
  total_load_trucks: number;

  @Prop({ type: Number })
  restricted_load: number;

  @Prop({ type: Number })
  registration_number: number;

  @Prop({ type: Number })
  model_serial_number: number;

  @Prop({ type: Number })
  Number_of_seats: number;

  @Prop({ type: String })
  Energy: string;

  @Prop({ type: Number })
  num_driving_license: number;

  @Prop({ type: Date })
  driving_license_history: Date;

  @Prop({ type: String })
  driving_license_dure: string;

  @Prop({ type: Date })
  line_activity_start_date: Date;

  @Prop({ type: Date })
  Vehicle_activity_start_date: Date;

  @Prop({ type: String })
  font_type: string;

  @Prop({ type: String })
  colonne4: string;

  @Prop({ type: String, index: true })
  font_symbol: string;

  @Prop({ type: String })
  point_depart: string;

  @Prop({ type: String })
  point_arrive: string;

  @Prop({ type: String })
  point_Traffic1: string;

  @Prop({ type: String })
  point_Traffic2: string;

  @Prop({ type: String })
  point_Traffic3: string;

  @Prop({ type: String })
  point_Traffic4: string;

  @Prop({ type: String })
  point_Traffic5: string;

  @Prop({ type: String })
  line_start_time: string;

  @Prop({ type: String })
  line_end_time: string;

  @Prop({ type: String })
  Pace_per_minute: string;

  @Prop({ type: String })
  time_depart1: string;

  @Prop({ type: String })
  time_depart2: string;

  @Prop({ type: String })
  time_depart3: string;

  @Prop({ type: String })
  time_depart4: string;

  @Prop({ type: String, enum: ['نعم', 'لا'] })
  vihicile_parked: string;

  @Prop({ type: String, enum: ['مؤقت', 'نهائي'] })
  type_parked: string;

  @Prop({ type: Date })
  hestoire_parked: Date;

  @Prop({ type: Date })
  hestoire_parked_end: Date;

  @Prop({ type: String })
  comments: string;

  @Prop({ type: String })
  person_concerned: string;

  @Prop({ type: String })
  note_chef_departement: string;

  @Prop({ type: String })
  path: string;

  @Prop({ type: Number,default: 0  })
  num_up: number;

  @Prop({ type: Boolean, default: false })
  is_permanently_parked: boolean;

  @Prop({ type: Date })
  permanent_parking_date: Date;

  @Prop({ type: String,default:null })
  old_font_symbol: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  createdBy: mongoose.Types.ObjectId;
}

export const VihiclesSchema = SchemaFactory.createForClass(Vihicles);
