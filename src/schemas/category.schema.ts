import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({
  toJSON: {
    versionKey: false,
    transform: excludeProperties,
  },
  timestamps: true,
  collection: 'category',
})
export class Category extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true, unique: true })
  name: string;

  @Field()
  @Prop({ required: true, default: true })
  active: boolean;

  @Field(() => Category, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parent: Category;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

function excludeProperties(doc: any, ret: any) {
  delete ret.createdAt;
  delete ret.updatedAt;
}
