using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;
using RedactMyPdf.Core.Models.Draw;
using RedactMyPdf.Core.Utils;

namespace RedactMyPdf.Viewer.Utils
{
    public class ShapeModelBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext == null)
                throw new ArgumentNullException(nameof(bindingContext));

            string valueFromBody;

            using (var sr = new StreamReader(bindingContext.HttpContext.Request.Body))
            {
                valueFromBody = sr.ReadToEndAsync().Result;
            }

            if (string.IsNullOrEmpty(valueFromBody))
            {
                return Task.CompletedTask;
            }

            var settings = new JsonSerializerSettings();
            settings.Converters.Add(new ShapeJsonConverter());

            try
            {
                var shapes = JsonConvert.DeserializeObject<IEnumerable<PageShapes>>(valueFromBody, settings);
                bindingContext.Result = ModelBindingResult.Success(shapes);
            }
            catch (Exception)
            {
                bindingContext.Result = ModelBindingResult.Failed();
                throw;
            }



            return Task.CompletedTask;
        }
    }
}
