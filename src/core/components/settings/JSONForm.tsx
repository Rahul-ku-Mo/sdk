import { memo, useEffect, useState } from "react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { includes } from "lodash-es";
import { getBlockJSONFromSchemas, getBlockJSONFromUISchemas } from "../../functions/Controls.ts";
import RjForm from "@rjsf/core";
import { BindingWidget } from "../../../ui/widgets/rjsf/widgets/binding.tsx";
import { IconPickerField, ImagePickerField, LinkField, RTEField } from "../../../ui";
import validator from "@rjsf/validator-ajv8";

type JSONFormType = {
  id?: string;
  formData: any;
  properties: any;
  onChange: ({ formData }: any, key?: string) => void;
};
/**
 *
 * @param param0
 * @returns JSONForm for Static and name fields
 */
export const JSONForm = memo(({ id, properties, formData, onChange }: JSONFormType) => {
  const [form, setForm] = useState<any>(formData);
  const propsSchema: RJSFSchema = { type: "object", properties: {} };
  const uiSchema: UiSchema = {};

  Object.keys(properties).forEach((key) => {
    const control = properties[key];
    if (includes(["slot", "styles"], control.type)) return;
    const propKey = key;
    propsSchema.properties[propKey] = getBlockJSONFromSchemas(control);
    uiSchema[propKey] = getBlockJSONFromUISchemas(control);
  });

  useEffect(() => {
    setForm(formData);
  }, [id]);

  return (
    <RjForm
      widgets={{
        binding: BindingWidget,
        richtext: RTEField,
        icon: IconPickerField,
        image: ImagePickerField,
      }}
      fields={{ link: LinkField }}
      idSeparator="."
      autoComplete="off"
      omitExtraData={false}
      liveOmit={false}
      liveValidate={false}
      validator={validator}
      uiSchema={uiSchema}
      schema={propsSchema}
      formData={form}
      onChange={({ formData: fD }, id) => {
        if (!id) return;
        setForm(fD);
        onChange({ formData: fD }, id);
      }}
    />
  );
});
