const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '  const handleSaveAndPersistJournals = () => {',
  '  const handleSaveAndPersistJournals = async () => {'
);
content = content.replace(
  '      const res = erpStore.persistAllJournalsToDatabase();',
  '      const res = await erpStore.persistAllJournalsToDatabase();'
);
content = content.replace(
  '  const handleSaveAndExit = () => {',
  '  const handleSaveAndExit = async () => {'
);
content = content.replace(
  '      const res = erpStore.persistAllJournalsToDatabase();',
  '      const res = await erpStore.persistAllJournalsToDatabase();'
);

// Do not report a generic import error after entries have already been added.
// Surface the real exception so 2021+ files do not look half-successful.
const oldCatch = `        } catch (err) {
          console.error(err);
          alert("حدث خطأ أثناء معالجة الملف. تأكد من أن الملف بنفس صيغة أوراكل.");
        } finally {`;
const newCatch = `        } catch (err: any) {
          console.error("[Oracle Import]", err);
          toast({
            title: "فشل استيراد قيود أوراكل",
            description: err?.message || "حدث خطأ أثناء معالجة ملف أوراكل.",
            variant: "destructive",
          });
        } finally {`;
if (content.includes(oldCatch)) content = content.replace(oldCatch, newCatch);

// The older outer handler is also made truthful.
content = content.replace(
  `    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاستيراد");`,
  `    } catch (err: any) {
      console.error("[Oracle Import]", err);
      toast({
        title: "فشل استيراد قيود أوراكل",
        description: err?.message || "حدث خطأ أثناء الاستيراد.",
        variant: "destructive",
      });`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Ledger persistence and Oracle import errors now use the real async/database result.');
